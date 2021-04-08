import crypto from 'crypto';
import fs from 'fs';
import fsPromises from 'fs/promises';
import moment from 'moment';
import EventEmitter from 'events';
import { PathLike } from 'fs';
import path from 'path';
import { MagicLog } from './util';
import { StatWorkers } from './StatWorker';
const picExt = ['.gif', '.jpeg', '.jpg', '.png'];

export enum ClassifyWay {
    cut, copy, test
}

export enum FileTimeMode {
    access = 'access',
    create = 'create',
    modify = 'modify',
    birth = 'birth'
}

export interface Option {
    mode?: ClassifyWay,
    timeMode?: FileTimeMode,
    recursive?: boolean,
    override?: boolean,
    extnames?: [string],
    picOnly?: boolean
}

interface File {
    filePath: string,
    name: string,
    time?: moment.Moment,
    hash?: string
}

export interface Pico {
    on(event: 'getFile', callback: () => void): this;
}


export class Pico extends EventEmitter {
    inputDir: string;
    outputDir: string;
    ext: Array<string> = [];
    option: Option = {
        mode: ClassifyWay.test,
        timeMode: FileTimeMode.birth,
        recursive: false,
        picOnly: false,
        override: false
    };
    files: Array<File> = [];
    logSuffix = `${moment().format('YYYYMMDD_HHmmss')}.log`;
    // Log Part1: Hash-File tree
    // Part2: Date-File tree
    // Part3: classify error, override log
    constructor(inputDir: string, outputDir: string, option?: Option) {
        super();
        this.inputDir = inputDir;
        this.outputDir = outputDir;
        if (inputDir === outputDir) {
            throw new Error('inputDir & outputDir is not supposed same.');
        }
        option && (this.option = Object.assign(this.option, option));
        if (this.option.picOnly) {
            this.ext = picExt;
        }
        if (this.option?.extnames) {
            this.ext = this.ext.concat(this.option.extnames);
        }
        StatWorkers.init();
    }

    public async process() {
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

    private createHashFileLog() {

    }

    // 单线程 faster than promise
    private async classify() {
        console.log('Classify...');
        console.time('classify');
        const fileHashMap = new Map();
        const destNameSet = new Set();
        const dirSet = new Set();
        // classify by date
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            await MagicLog.echo(`progress: ${i}/${this.files.length} Classify ${file.name}`);
            if (!file.time || !file.hash) continue;
            if (!fileHashMap.has(file.hash)) {
                fileHashMap.set(file.hash, [file]);
                const dirName = file.time.format('YYYY-MM-DD');
                const dirPath = path.join(this.outputDir, dirName);
                // 同名但hash不同的文件，后者缀上hash值后八位
                let destFile = path.join(dirPath, file.name);
                if (!destNameSet.has(destFile)) {
                    destNameSet.add(destFile);
                } else {
                    // name = 'file_len8hash.xxx'
                    const name = path.basename(destFile, path.extname(destFile)) + '_' + file.hash.slice(file.hash.length - 8) + path.extname(destFile);
                    destFile = path.join(path.dirname(destFile), name);
                    destNameSet.add(destFile);
                }
                if (this.option.mode === ClassifyWay.copy) {
                    !dirSet.has(dirPath) && await this.createDirIfNotExist(dirPath) && dirSet.add(dirPath);
                    await fsPromises.copyFile(file.filePath, destFile, this.option.override ? undefined : fs.constants.COPYFILE_EXCL);
                }
            } else {
                fileHashMap.set(file.hash, fileHashMap.get(file.hash).push(file));
            }
        }
        await MagicLog.echo(`progress: ${this.files.length}/${this.files.length}`);
        MagicLog.newline();
        console.timeEnd('classify');
    }

    private async createDirIfNotExist(dirPath: PathLike) {
        let dirStat;
        try {
            dirStat = await fsPromises.stat(dirPath);
        } catch (e) { }
        if (!(dirStat?.isDirectory())) {
            await fsPromises.mkdir(dirPath, { recursive: true });
            return false
        }
        return true;
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
        console.time('getFilesStat');
        const pArr: Promise<void>[] = [];
        let index = 0;
        this.files.forEach(file => {
            pArr.push(this.getDate(file.filePath).then(time => { Object.assign(file, { time: moment(time) }) }));
            pArr.push(StatWorkers.exec(file.filePath).then(async hash => {
                Object.assign(file, { hash });
                await MagicLog.echo(`progress: ${++index}/${this.files.length}`);
            }));
        });
        await Promise.all(pArr);
        await MagicLog.echo(`progress: ${this.files.length}/${this.files.length}`);
        MagicLog.newline();
        console.timeEnd('getFilesStat');
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
                return birthtime;
        }
    }

}
