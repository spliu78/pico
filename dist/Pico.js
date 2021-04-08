"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pico = exports.FileTimeMode = exports.ClassifyWay = void 0;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const moment_1 = __importDefault(require("moment"));
const events_1 = __importDefault(require("events"));
const path_1 = __importDefault(require("path"));
const util_1 = require("./util");
const StatWorker_1 = require("./StatWorker");
const picExt = ['.gif', '.jpeg', '.jpg', '.png'];
var ClassifyWay;
(function (ClassifyWay) {
    ClassifyWay[ClassifyWay["cut"] = 0] = "cut";
    ClassifyWay[ClassifyWay["copy"] = 1] = "copy";
    ClassifyWay[ClassifyWay["test"] = 2] = "test";
})(ClassifyWay = exports.ClassifyWay || (exports.ClassifyWay = {}));
var FileTimeMode;
(function (FileTimeMode) {
    FileTimeMode["access"] = "access";
    FileTimeMode["create"] = "create";
    FileTimeMode["modify"] = "modify";
    FileTimeMode["birth"] = "birth";
})(FileTimeMode = exports.FileTimeMode || (exports.FileTimeMode = {}));
class Pico extends events_1.default {
    // Log Part1: Hash-File tree
    // Part2: Date-File tree
    // Part3: classify error, override log
    constructor(inputDir, outputDir, option) {
        var _a;
        super();
        this.ext = [];
        this.option = {
            mode: ClassifyWay.test,
            timeMode: FileTimeMode.birth,
            recursive: false,
            picOnly: false,
            override: false
        };
        this.files = [];
        this.logSuffix = `${moment_1.default().format('YYYYMMDD_HHmmss')}.log`;
        this.inputDir = inputDir;
        this.outputDir = outputDir;
        if (inputDir === outputDir) {
            throw new Error('inputDir & outputDir is not supposed same.');
        }
        option && (this.option = Object.assign(this.option, option));
        if (this.option.picOnly) {
            this.ext = picExt;
        }
        if ((_a = this.option) === null || _a === void 0 ? void 0 : _a.extnames) {
            this.ext = this.ext.concat(this.option.extnames);
        }
        StatWorker_1.StatWorkers.init();
    }
    async process() {
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
    createHashFileLog() {
    }
    // 单线程 faster than promise
    async classify() {
        console.log('Classify...');
        console.time('classify');
        const fileHashMap = new Map();
        const destNameSet = new Set();
        const dirSet = new Set();
        // classify by date
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            await util_1.MagicLog.echo(`progress: ${i}/${this.files.length} Classify ${file.name}`);
            if (!file.time || !file.hash)
                continue;
            if (!fileHashMap.has(file.hash)) {
                fileHashMap.set(file.hash, [file]);
                const dirName = file.time.format('YYYY-MM-DD');
                const dirPath = path_1.default.join(this.outputDir, dirName);
                // 同名但hash不同的文件，后者缀上hash值后八位
                let destFile = path_1.default.join(dirPath, file.name);
                if (!destNameSet.has(destFile)) {
                    destNameSet.add(destFile);
                }
                else {
                    // name = 'file_len8hash.xxx'
                    const name = path_1.default.basename(destFile, path_1.default.extname(destFile)) + '_' + file.hash.slice(file.hash.length - 8) + path_1.default.extname(destFile);
                    destFile = path_1.default.join(path_1.default.dirname(destFile), name);
                    destNameSet.add(destFile);
                }
                if (this.option.mode === ClassifyWay.copy) {
                    !dirSet.has(dirPath) && await this.createDirIfNotExist(dirPath) && dirSet.add(dirPath);
                    await promises_1.default.copyFile(file.filePath, destFile, this.option.override ? undefined : fs_1.default.constants.COPYFILE_EXCL);
                }
            }
            else {
                fileHashMap.set(file.hash, fileHashMap.get(file.hash).push(file));
            }
        }
        await util_1.MagicLog.echo(`progress: ${this.files.length}/${this.files.length}`);
        util_1.MagicLog.newline();
        console.timeEnd('classify');
    }
    async createDirIfNotExist(dirPath) {
        let dirStat;
        try {
            dirStat = await promises_1.default.stat(dirPath);
        }
        catch (e) { }
        if (!(dirStat === null || dirStat === void 0 ? void 0 : dirStat.isDirectory())) {
            await promises_1.default.mkdir(dirPath, { recursive: true });
            return false;
        }
        return true;
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
        console.time('getFilesStat');
        const pArr = [];
        let index = 0;
        this.files.forEach(file => {
            pArr.push(this.getDate(file.filePath).then(time => { Object.assign(file, { time: moment_1.default(time) }); }));
            pArr.push(StatWorker_1.StatWorkers.exec(file.filePath).then(async (hash) => {
                Object.assign(file, { hash });
                await util_1.MagicLog.echo(`progress: ${++index}/${this.files.length}`);
            }));
        });
        await Promise.all(pArr);
        await util_1.MagicLog.echo(`progress: ${this.files.length}/${this.files.length}`);
        util_1.MagicLog.newline();
        console.timeEnd('getFilesStat');
    }
    async getDate(filePath) {
        const { atime, mtime, ctime, birthtime } = await promises_1.default.stat(filePath);
        // console.log(filePath);
        // console.log({ atime, mtime, ctime, birthtime });
        switch (this.option.timeMode) {
            case FileTimeMode.access:
                return atime;
            case FileTimeMode.create:
                return ctime;
            case FileTimeMode.modify:
                return mtime;
            case FileTimeMode.birth:
                return birthtime;
            default:
                return birthtime;
        }
    }
}
exports.Pico = Pico;
//# sourceMappingURL=Pico.js.map