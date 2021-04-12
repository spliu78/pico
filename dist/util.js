"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileExist = exports.createDirIfNotExist = exports.MagicLog = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const readline_1 = __importDefault(require("readline"));
const term_size_1 = __importDefault(require("term-size"));
class MagicLog {
    static echo(str) {
        return new Promise((resolve) => {
            str = str.length > MagicLog.screenMax ? str.slice(0, MagicLog.screenMax) + '...' : str;
            readline_1.default.clearLine(process.stdout, 0, () => {
                readline_1.default.cursorTo(process.stdout, 0, undefined, () => {
                    process.stdout.write(str);
                    resolve();
                });
            });
        });
    }
    static newline() {
        process.stdout.write('\n');
    }
}
exports.MagicLog = MagicLog;
MagicLog.screenMax = term_size_1.default().columns - 3;
const createDirIfNotExist = async (dirPath) => {
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
};
exports.createDirIfNotExist = createDirIfNotExist;
const fileExist = async (path) => {
    try {
        await promises_1.default.access(path);
        return true;
    }
    catch (e) {
        return false;
    }
};
exports.fileExist = fileExist;
//# sourceMappingURL=util.js.map