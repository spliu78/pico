"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatWorkers = void 0;
const os_1 = __importDefault(require("os"));
const node_worker_threads_pool_1 = require("node-worker-threads-pool");
const workerCount = os_1.default.cpus().length - 1;
// export const statWorkers = new StaticPool({
//     size: cpusLength,
//     task: (filePath: string): Promise<string> => {
//         const crypto = require('crypto');
//         const fs = require('fs');
//         return new Promise((resolve) => {
//             const hash = crypto.createHash('SHA256');
//             const stream = fs.createReadStream(filePath);
//             stream.on('data', function (chunk: string) {
//                 hash.update(chunk);
//             });
//             stream.on('end', () => {
//                 resolve(hash.digest('hex'));
//             });
//         });
//     }
// });
class StatWorkers {
    static init() {
        this.workers = this.workers || new node_worker_threads_pool_1.StaticPool({
            size: workerCount,
            task: (filePath) => {
                const crypto = require('crypto');
                const fs = require('fs');
                return new Promise((resolve) => {
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
        });
    }
    static async exec(str) {
        var _a;
        return (_a = this.workers) === null || _a === void 0 ? void 0 : _a.exec(str);
    }
    static destroy() {
        var _a;
        (_a = this.workers) === null || _a === void 0 ? void 0 : _a.destroy();
    }
}
exports.StatWorkers = StatWorkers;
StatWorkers.workers = null;
// staticPool.exec('./readme.md').then((result) => {
//     console.log("result from thread pool:", result); // result will be 2.
// });
//# sourceMappingURL=StatWorker.js.map