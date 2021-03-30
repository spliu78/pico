"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pico = exports.FileTimeMode = exports.ClassifyWay = void 0;
var fs_1 = __importDefault(require("fs"));
var promises_1 = __importDefault(require("fs/promises"));
var path_1 = __importDefault(require("path"));
var crypto_1 = __importDefault(require("crypto"));
var moment_1 = __importDefault(require("moment"));
var picExt = ['.gif', '.jpeg', '.jpg', '.png'];
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
var Pico = /** @class */ (function () {
    function Pico(inputDir, outputDir, option) {
        var _a;
        this.ext = [];
        this.option = {
            mode: ClassifyWay.test,
            timeMode: FileTimeMode.birth,
            recursive: false,
            picOnly: false,
            override: false
        };
        this.files = [];
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
    }
    Pico.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // get files
                    return [4 /*yield*/, this.getFiles(this.inputDir)];
                    case 1:
                        // get files
                        _a.sent();
                        // for (const file of this.files) {
                        //     console.log(JSON.stringify(file, null, 2));
                        // }
                        // classify
                        return [4 /*yield*/, this.classify()];
                    case 2:
                        // for (const file of this.files) {
                        //     console.log(JSON.stringify(file, null, 2));
                        // }
                        // classify
                        _a.sent();
                        console.log('Job Done!');
                        return [2 /*return*/];
                }
            });
        });
    };
    Pico.prototype.classify = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileSet, _i, _a, file, dirName, dirPath, e_1, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fileSet = new Set();
                        _i = 0, _a = this.files;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        file = _a[_i];
                        if (fileSet.has(file.hash)) {
                            this.handleRepeatFile(file);
                            return [2 /*return*/];
                        }
                        fileSet.add(file.hash);
                        dirName = file.time.format('YYYY-MM-DD');
                        dirPath = path_1.default.join(this.outputDir, dirName);
                        console.log(file.filePath + " will be copy to " + dirPath);
                        if (!(this.option.mode === ClassifyWay.copy || this.option.mode === ClassifyWay.cut)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.createDirIfNotExist(dirPath)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 9, , 10]);
                        return [4 /*yield*/, promises_1.default.copyFile(file.filePath, path_1.default.join(dirPath, file.name), this.option.override ? undefined : fs_1.default.constants.COPYFILE_EXCL)];
                    case 4:
                        _b.sent();
                        if (!(this.option.mode === ClassifyWay.cut)) return [3 /*break*/, 8];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        console.log(file.filePath + " will be delete!");
                        return [4 /*yield*/, promises_1.default.rm(file.filePath)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_1 = _b.sent();
                        console.log(file.filePath + " delete failed!");
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_2 = _b.sent();
                        console.log(file.filePath + " copy failed!");
                        return [3 /*break*/, 10];
                    case 10:
                        _i++;
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    Pico.prototype.createDirIfNotExist = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var dirStat, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promises_1.default.stat(dirPath)];
                    case 1:
                        dirStat = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        if (!!(dirStat === null || dirStat === void 0 ? void 0 : dirStat.isDirectory())) return [3 /*break*/, 5];
                        console.log("Dir " + dirPath + " is not exist, will be created.");
                        return [4 /*yield*/, promises_1.default.mkdir(dirPath, { recursive: true })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Pico.prototype.handleRepeatFile = function (file) {
        console.log(file.name + " hash repeat, skip");
    };
    Pico.prototype.getFiles = function (dirPath) {
        return __awaiter(this, void 0, void 0, function () {
            var files, _i, files_1, file, filePath, time, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promises_1.default.readdir(dirPath, { withFileTypes: true })];
                    case 1:
                        files = _a.sent();
                        _i = 0, files_1 = files;
                        _a.label = 2;
                    case 2:
                        if (!(_i < files_1.length)) return [3 /*break*/, 8];
                        file = files_1[_i];
                        filePath = path_1.default.join(dirPath, file.name);
                        if (!(file.isDirectory() && this.option.recursive)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getFiles(filePath)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        if (!file.isFile()) return [3 /*break*/, 7];
                        if (!(!this.ext.length || this.ext.includes(path_1.default.extname(file.name).toLowerCase()))) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getDate(filePath)];
                    case 5:
                        time = _a.sent();
                        return [4 /*yield*/, this.getFileHash(filePath)];
                    case 6:
                        hash = _a.sent();
                        this.files.push({ name: file.name, filePath: filePath, time: moment_1.default(time), hash: hash });
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    Pico.prototype.getDate = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, atime, mtime, ctime, birthtime;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, promises_1.default.stat(filePath)];
                    case 1:
                        _a = _b.sent(), atime = _a.atime, mtime = _a.mtime, ctime = _a.ctime, birthtime = _a.birthtime;
                        // console.log(filePath);
                        // console.log({ atime, mtime, ctime, birthtime });
                        switch (this.option.timeMode) {
                            case FileTimeMode.access:
                                return [2 /*return*/, atime];
                            case FileTimeMode.create:
                                return [2 /*return*/, ctime];
                            case FileTimeMode.modify:
                                return [2 /*return*/, mtime];
                            case FileTimeMode.birth:
                                return [2 /*return*/, birthtime];
                            default:
                                return [2 /*return*/, birthtime];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Pico.prototype.getFileHash = function (filePath) {
        return new Promise(function (resolve, reject) {
            var hash = crypto_1.default.createHash('SHA256');
            var stream = fs_1.default.createReadStream(filePath);
            stream.on('data', function (chunk) {
                hash.update(chunk);
            });
            stream.on('end', function () {
                resolve(hash.digest('hex'));
            });
        });
    };
    return Pico;
}());
exports.Pico = Pico;
//# sourceMappingURL=Pico.js.map