"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pico = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const util_1 = require("./util");
const StatWorker_1 = require("./StatWorker");
const enum_1 = require("./types/enum");
const PicoData_1 = __importDefault(require("./PicoData"));
const picExt = ['.gif', '.jpeg', '.jpg', '.png'];
class Pico {
    constructor(inputDir, outputDir, option) {
        var _a;
        this.ext = [];
        this.option = {
            mode: enum_1.ClassifyWay.test,
            timeMode: enum_1.FileTimeMode.birth,
            recursive: false,
            picOnly: false,
            override: false
        };
        this.files = [];
        if (inputDir === outputDir) {
            throw new Error('inputDir & outputDir is not supposed same.');
        }
        this.inputDir = path_1.default.resolve(inputDir);
        this.outputDir = path_1.default.resolve(outputDir);
        option && (this.option = Object.assign(this.option, option));
        if (this.option.picOnly) {
            this.ext = picExt;
        }
        if ((_a = this.option) === null || _a === void 0 ? void 0 : _a.extnames) {
            this.ext = this.ext.concat(this.option.extnames);
        }
        this.picoData = new PicoData_1.default(outputDir);
    }
    async init() {
        console.log('init...');
        StatWorker_1.StatWorkers.init();
        await this.picoData.init();
    }
    async process() {
        await this.init();
        // get files list
        await this.getFiles(this.inputDir);
        // get files stat
        await this.getFilesStat();
        // classify
        await this.classify();
        console.log('Job Done!');
        this.destroy();
    }
    destroy() {
        StatWorker_1.StatWorkers.destroy();
    }
    // 单线程 faster than promise
    async classify() {
        console.log('Classify...');
        console.time('Classify');
        const fileHashMap = this.picoData.hashMap;
        const destNameSet = new Set();
        const dirSet = new Set();
        const execArr = [];
        // classify by date
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            await util_1.MagicLog.echo(`Classify: ${i}/${this.files.length} Classify ${file.name}`);
            if (!file.time || !file.hash)
                continue;
            if (!fileHashMap.has(file.hash)) {
                fileHashMap.set(file.hash, [file]);
                const dirName = file.time.format('YYYY-MM-DD');
                const dirPath = path_1.default.join(this.outputDir, './picos', dirName);
                // 同名但hash不同的文件，后者缀上hash值后八位
                let destFile = path_1.default.join(dirPath, file.name);
                if (!destNameSet.has(destFile)) {
                    destNameSet.add(destFile);
                }
                else {
                    // rewrite name = 'file_len8hash.xxx'
                    const name = path_1.default.basename(destFile, path_1.default.extname(destFile)) + '_' + file.hash.slice(file.hash.length - 8) + path_1.default.extname(destFile);
                    destFile = path_1.default.join(path_1.default.dirname(destFile), name);
                    destNameSet.add(destFile);
                }
                let status = 'create';
                if (this.option.mode === enum_1.ClassifyWay.copy) {
                    !dirSet.has(dirPath) && await util_1.createDirIfNotExist(dirPath) && dirSet.add(dirPath);
                    try {
                        await promises_1.default.copyFile(file.filePath, destFile, this.option.override ? undefined : fs_1.default.constants.COPYFILE_EXCL);
                    }
                    catch (e) {
                        status = 'conflict';
                    }
                }
                execArr.push({ file, status, destName: path_1.default.basename(destFile), destDir: path_1.default.dirname(destFile) });
            }
            else {
                const fileArr = fileHashMap.get(file.hash) || new Array();
                fileArr.push(file);
                fileHashMap.set(file.hash, fileArr);
                execArr.push({ file, status: 'hashRepeat' });
            }
        }
        await util_1.MagicLog.echo(`Classify: ${this.files.length}/${this.files.length}`);
        util_1.MagicLog.newline();
        console.timeEnd('Classify');
        await this.picoData.genPicoData(fileHashMap, execArr);
    }
    async getFiles(dirPath, recursive = false) {
        !recursive && await util_1.MagicLog.echo('Loading files... ');
        const files = await promises_1.default.readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = path_1.default.join(dirPath, file.name);
            if (file.isDirectory() && this.option.recursive) {
                await this.getFiles(filePath, true);
            }
            else if (file.isFile()) {
                if (!this.ext.length || this.ext.includes(path_1.default.extname(file.name).toLowerCase())) {
                    this.files.push({ name: file.name, filePath });
                    await util_1.MagicLog.echo(`Loading files... Count: ${this.files.length}`);
                }
            }
        }
        !recursive && util_1.MagicLog.newline();
    }
    // 线程模式 fastest!
    async getFilesStat() {
        console.log('Get info...');
        console.time('Get info');
        const pArr = [];
        let index = 0;
        this.files.forEach(file => {
            pArr.push(this.getDate(file.filePath)
                .then(time => {
                Object.assign(file, {
                    time: moment_1.default(time)
                });
            }));
            pArr.push(StatWorker_1.StatWorkers.exec(file.filePath).then(async (hash) => {
                Object.assign(file, { hash });
                await util_1.MagicLog.echo(`progress: ${++index}/${this.files.length}`);
            }));
        });
        await Promise.all(pArr);
        await util_1.MagicLog.echo(`progress: ${this.files.length}/${this.files.length}`);
        util_1.MagicLog.newline();
        console.timeEnd('Get info');
    }
    async getDate(filePath) {
        const { atime, mtime, ctime, birthtime } = await promises_1.default.stat(filePath);
        // console.log(filePath);
        // console.log({ atime, mtime, ctime, birthtime });
        switch (this.option.timeMode) {
            case enum_1.FileTimeMode.access:
                return atime;
            case enum_1.FileTimeMode.create:
                return ctime;
            case enum_1.FileTimeMode.modify:
                return mtime;
            case enum_1.FileTimeMode.birth:
                return birthtime;
            default:
                return mtime;
        }
    }
}
exports.Pico = Pico;
//# sourceMappingURL=Pico.js.map