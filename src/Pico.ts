import fs from 'fs';
import fsPromises from 'fs/promises';
import moment from 'moment';
import path from 'path';
import { MagicLog, createDirIfNotExist } from './util';
import { StatWorkers } from './StatWorker';
import { ClassifyWay, ExecStatusString, FileTimeMode, FileTimeModeString } from './types/enum';
import PicoData from './PicoData';
const picExt = ['.gif', '.jpeg', '.jpg', '.png'];

export class Pico {
    inputDir: string;
    outputDir: string;
    ext: Array<string> = [];
    option: PicoOption = {
        mode: ClassifyWay.test,
        timeMode: FileTimeMode.birth,
        recursive: false,
        picOnly: false,
        override: false
    };
    files: Array<PicoFile> = [];
    picoData: PicoData;

    constructor(inputDir: string, outputDir: string, option?: PicoOption) {
        if (inputDir === outputDir) {
            throw new Error('inputDir & outputDir is not supposed same.');
        }
        this.inputDir = path.resolve(inputDir);
        this.outputDir = path.resolve(outputDir);
        option && (this.option = Object.assign(this.option, option));
        if (this.option.picOnly) {
            this.ext = picExt;
        }
        if (this.option?.extnames) {
            this.ext = this.ext.concat(this.option.extnames);
        }
        this.picoData = new PicoData(outputDir);
    }

    private async init() {
        console.log('init...');
        StatWorkers.init();
        await this.picoData.init();
    }

    public async process() {
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

    private destroy() {
        StatWorkers.destroy();
    }

    // 单线程 faster than promise
    private async classify() {
        console.log('Classify...');
        console.time('Classify');
        const fileHashMap = this.picoData.hashMap;
        const destNameSet = new Set();
        const dirSet = new Set();
        const execArr: Array<ExecType> = [];
        // classify by date
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            await MagicLog.echo(`Classify: ${i}/${this.files.length} Classify ${file.name}`);
            if (!file.time || !file.hash) continue;
            if (!fileHashMap.has(file.hash)) {
                fileHashMap.set(file.hash, [file]);
                const dirName = file.time.format('YYYY-MM-DD');
                const dirPath = path.join(this.outputDir, './picos', dirName);

                // 同名但hash不同的文件，后者缀上hash值后八位
                let destFile = path.join(dirPath, file.name);
                if (!destNameSet.has(destFile)) {
                    destNameSet.add(destFile);
                } else {
                    // rewrite name = 'file_len8hash.xxx'
                    const name = path.basename(destFile, path.extname(destFile)) + '_' + file.hash.slice(file.hash.length - 8) + path.extname(destFile);
                    destFile = path.join(path.dirname(destFile), name);
                    destNameSet.add(destFile);
                }
                let status: ExecStatusString = 'create';

                if (this.option.mode === ClassifyWay.copy) {
                    !dirSet.has(dirPath) && await createDirIfNotExist(dirPath) && dirSet.add(dirPath);
                    try {
                        await fsPromises.copyFile(file.filePath, destFile, this.option.override ? undefined : fs.constants.COPYFILE_EXCL);
                    } catch (e) {
                        status = 'conflict';
                    }
                }
                execArr.push({ file, status, destName: path.basename(destFile), destDir: path.dirname(destFile) });
            } else {
                const fileArr = fileHashMap.get(file.hash) || new Array<PicoFile>();
                fileArr.push(file);
                fileHashMap.set(file.hash, fileArr);
                execArr.push({ file, status: 'hashRepeat' });
            }
        }
        await MagicLog.echo(`Classify: ${this.files.length}/${this.files.length}`);
        MagicLog.newline();
        console.timeEnd('Classify');
        await this.picoData.genPicoData(fileHashMap, execArr);
    }

    private async getFiles(dirPath: string, recursive = false) {
        !recursive && await MagicLog.echo('Loading files... ');
        const files = await fsPromises.readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            if (file.isDirectory() && this.option.recursive) {
                await this.getFiles(filePath, true);
            } else if (file.isFile()) {
                if (!this.ext.length || this.ext.includes(path.extname(file.name).toLowerCase())) {
                    this.files.push({ name: file.name, filePath });
                    await MagicLog.echo(`Loading files... Count: ${this.files.length}`);
                }
            }
        }
        !recursive && MagicLog.newline();
    }

    // 线程模式 fastest!
    private async getFilesStat() {
        console.log('Get info...');
        console.time('Get info');
        const pArr: Promise<void>[] = [];
        let index = 0;
        this.files.forEach(file => {
            pArr.push(this.getDate(file.filePath)
                .then(time => {
                    Object.assign(file, {
                        time: moment(time)
                    })
                })
            );
            pArr.push(StatWorkers.exec(file.filePath).then(async hash => {
                Object.assign(file, { hash });
                await MagicLog.echo(`progress: ${++index}/${this.files.length}`);
            }));
        });
        await Promise.all(pArr);
        await MagicLog.echo(`progress: ${this.files.length}/${this.files.length}`);
        MagicLog.newline();
        console.timeEnd('Get info');
    }

    public async getDate(filePath: string) {
        const { atime, mtime, ctime, birthtime } = await fsPromises.stat(filePath);
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
                return mtime;
        }
    }

}
