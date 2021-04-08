"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecStatus = exports.FileTimeMode = exports.ClassifyWay = void 0;
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
var ExecStatus;
(function (ExecStatus) {
    ExecStatus[ExecStatus["hashRepeat"] = 0] = "hashRepeat";
    ExecStatus[ExecStatus["create"] = 1] = "create";
    ExecStatus[ExecStatus["conflict"] = 2] = "conflict";
})(ExecStatus = exports.ExecStatus || (exports.ExecStatus = {}));
//# sourceMappingURL=enum.js.map