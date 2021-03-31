"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewriteTty = exports.MagicLog = void 0;
var readline_1 = __importDefault(require("readline"));
var MagicLog = /** @class */ (function () {
    function MagicLog() {
    }
    MagicLog.echo = function (str) {
        readline_1.default.clearLine(process.stdout, 0);
        readline_1.default.cursorTo(process.stdout, 0);
        process.stdout.write(str);
    };
    MagicLog.newline = function () {
        process.stdout.write('\n');
    };
    return MagicLog;
}());
exports.MagicLog = MagicLog;
var rewriteTty = function (str) {
    readline_1.default.clearLine(process.stdout, 0);
    readline_1.default.cursorTo(process.stdout, 0);
    process.stdout.write(str);
};
exports.rewriteTty = rewriteTty;
//# sourceMappingURL=util.js.map