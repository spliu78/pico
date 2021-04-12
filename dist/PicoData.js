"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const moment_1 = __importDefault(require("moment"));
const path_1 = __importDefault(require("path"));
const util_1 = require("./util");
class PicoData {
    constructor(outputDir) {
        this.hashMap = new Map();
        this.picoDataDir = `.pico`;
        this.dateTime = moment_1.default().format('YYYYMMDD_HHmmss');
        this.picoPath = path_1.default.join(outputDir, this.picoDataDir);
        this.hashFile = path_1.default.join(this.picoPath, 'File-Hash.data');
        this.fileMoveLog = path_1.default.join(this.picoPath, `FileMove_${this.dateTime}.log`);
    }
    async init() {
        if (await util_1.fileExist(this.hashFile)) {
            const str = await promises_1.default.readFile(this.hashFile, { encoding: 'utf8' });
            str.split('\n').forEach((row) => {
                const [_path, _repeatCount, hash] = row.split('\t');
                if (!this.hashMap.has(hash)) {
                    this.hashMap.set(hash, []);
                }
            });
        }
    }
    async genPicoData(fileHashMap, execArr) {
        this.picoPath;
        await util_1.createDirIfNotExist(this.picoPath);
        // File-Hash Data
        // path \t repeatCount \t hash
        let fileHashData = '';
        fileHashMap.forEach((fileArr) => {
            fileArr.forEach((file, _index, arr) => {
                fileHashData += `${file.filePath}\t${arr.length}\t${file.hash}\n`;
            });
        });
        await promises_1.default.writeFile(this.hashFile, fileHashData);
        await promises_1.default.copyFile(this.hashFile, `${this.hashFile}.${this.dateTime}`);
        // Dir-File Data
        // fileName \t status (hashRepeat/created/conflict) \t newFileName(when rename) | null \t from \t to | null(when skip) 
        let fileMoveData = '';
        execArr.forEach(({ file, status, destDir = '', destName = '' }) => {
            fileMoveData += `${file.name}\t${status}\t${(destName && destName === file.name) ? '' : destName}\t${file.filePath}\t${destDir}\n`;
        });
        await promises_1.default.writeFile(this.fileMoveLog, fileMoveData);
    }
}
exports.default = PicoData;
//# sourceMappingURL=PicoData.js.map