"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = __importDefault(require("readline"));
(function () {
    var str = '123321123123123123123';
    var c = 0;
    setInterval(function () {
        readline_1.default.clearLine(process.stdout, 0);
        readline_1.default.cursorTo(process.stdout, 0);
        process.stdout.write(str + '\n');
        str = '' + c;
        c++;
    }, 1000);
})();
//# sourceMappingURL=test.js.map