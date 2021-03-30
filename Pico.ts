import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import moment from 'moment';
import { PathLike } from 'node:fs';
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
    time: moment.Moment,
    hash: string
}

export class Pico {
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

    constructor(inputDir: string, outputDir: string, option?: Option) {
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
    }

    public async process() {
        // get files
        await this.getFiles(this.inputDir);
        // for (const file of this.files) {
        //     console.log(JSON.stringify(file, null, 2));
        // }
        // classify
        await this.classify();
        console.log('Job Done!');
    }
    public async classify() {
        // 
        const fileSet = new Set();
        // classify by date
        for (const file of this.files) {
            if (fileSet.has(file.hash)) {
                this.handleRepeatFile(file);
                return;
            }
            fileSet.add(file.hash);
            const dirName = file.time.format('YYYY-MM-DD');
            const dirPath = path.join(this.outputDir, dirName);
            console.log(`${file.filePath} will be copy to ${dirPath}`);
            if (this.option.mode === ClassifyWay.copy || this.option.mode === ClassifyWay.cut) {
                await this.createDirIfNotExist(dirPath);
                try {
                    await fsPromises.copyFile(file.filePath, path.join(dirPath, file.name), this.option.override ? undefined : fs.constants.COPYFILE_EXCL);
                    if (this.option.mode === ClassifyWay.cut) {
                        try {
                            console.log(`${file.filePath} will be delete!`);
                            await fsPromises.rm(file.filePath);
                        } catch (e) {
                            console.log(`${file.filePath} delete failed!`);
                        }
                    }
                } catch (e) {
                    console.log(`${file.filePath} copy failed!`);
                }
            }
        }
    }
    public async createDirIfNotExist(dirPath: PathLike) {
        let dirStat;
        try {
            dirStat = await fsPromises.stat(dirPath);
        } catch (e) { }
        if (!(dirStat?.isDirectory())) {
            console.log(`Dir ${dirPath} is not exist, will be created.`);
            await fsPromises.mkdir(dirPath, { recursive: true });
        }
    }
    public handleRepeatFile(file: File) {
        console.log(`${file.name} hash repeat, skip`);
    }
    public async getFiles(dirPath: string) {
        const files = await fsPromises.readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            if (file.isDirectory() && this.option.recursive) {
                await this.getFiles(filePath);
            } else if (file.isFile()) {
                if (!this.ext.length || this.ext.includes(path.extname(file.name).toLowerCase())) {
                    const time = await this.getDate(filePath);
                    const hash = await this.getFileHash(filePath);
                    this.files.push({ name: file.name, filePath, time: moment(time), hash });
                }
            }
        }
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
    public getFileHash(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('SHA256');
            const stream = fs.createReadStream(filePath);
            stream.on('data', function (chunk) {
                hash.update(chunk);
            });
            stream.on('end', () => {
                resolve(hash.digest('hex'));
            });
        });
    }
}
