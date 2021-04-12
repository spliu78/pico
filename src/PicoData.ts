
import fsPromises from 'fs/promises';
import moment from 'moment';
import path from 'path';
import { fileExist, createDirIfNotExist } from './util';

export default class PicoData {
    public hashMap: Map<string, Array<PicoFile>> = new Map();
    private picoDataDir = `.pico`;
    private picoPath: string;
    private fileMoveLog: string;
    private hashFile: string;
    private dateTime = moment().format('YYYYMMDD_HHmmss');
    constructor(outputDir: string) {
        this.picoPath = path.join(outputDir, this.picoDataDir);
        this.hashFile = path.join(this.picoPath, 'File-Hash.data');
        this.fileMoveLog = path.join(this.picoPath, `FileMove_${this.dateTime}.log`);
    }
    public async init() {
        if (await fileExist(this.hashFile)) {
            const str = await fsPromises.readFile(this.hashFile, { encoding: 'utf8' });
            str.split('\n').forEach((row) => {
                const [_path, _repeatCount, hash] = row.split('\t');
                if (!this.hashMap.has(hash)) {
                    this.hashMap.set(hash, []);
                }
            });
        }
    }

    public async genPicoData(
        fileHashMap: Map<string, Array<PicoFile>>,
        execArr: Array<ExecType>,
    ) {
        this.picoPath;
        await createDirIfNotExist(this.picoPath);
        // File-Hash Data
        // path \t repeatCount \t hash
        let fileHashData = '';
        fileHashMap.forEach((fileArr) => {
            fileArr.forEach((file, _index, arr) => {
                fileHashData += `${file.filePath}\t${arr.length}\t${file.hash}\n`;
            });
        });
        await fsPromises.writeFile(this.hashFile, fileHashData);
        await fsPromises.copyFile(this.hashFile, `${this.hashFile}.${this.dateTime}`);
        // Dir-File Data
        // fileName \t status (hashRepeat/created/conflict) \t newFileName(when rename) | null \t from \t to | null(when skip) 
        let fileMoveData = '';
        execArr.forEach(({ file, status, destDir = '', destName = '' }) => {
            fileMoveData += `${file.name}\t${status}\t${(destName && destName === file.name) ? '' : destName}\t${file.filePath}\t${destDir}\n`;
        });
        await fsPromises.writeFile(this.fileMoveLog, fileMoveData);
    }
}