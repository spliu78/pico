import os from 'os';
import { StaticPool } from 'node-worker-threads-pool';
const workerCount = os.cpus().length - 1;
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

export class StatWorkers {
    private static workers: StaticPool<string, string, any> | null = null;
    public static init() {
        this.workers = this.workers || new StaticPool({
            size: workerCount,
            task: (filePath: string): Promise<string> => {
                const crypto = require('crypto');
                const fs = require('fs');
                return new Promise((resolve) => {
                    const hash = crypto.createHash('SHA256');
                    const stream = fs.createReadStream(filePath);
                    stream.on('data', function (chunk: string) {
                        hash.update(chunk);
                    });
                    stream.on('end', () => {
                        resolve(hash.digest('hex'));
                    });
                });
            }
        });
    }
    public static async exec(str: string) {
        return this.workers?.exec(str);
    }
    public static destroy() {
        this.workers?.destroy();
    }
}

// staticPool.exec('./readme.md').then((result) => {
//     console.log("result from thread pool:", result); // result will be 2.
// });
