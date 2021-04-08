import readline from 'readline';
import termSize from 'term-size';
export class MagicLog {
    static screenMax = termSize().columns - 3;
    public static echo(str: string) {
        return new Promise<void>((resolve) => {
            str = str.length > MagicLog.screenMax ? str.slice(0, MagicLog.screenMax) + '...' : str;
            readline.clearLine(process.stdout, 0, () => {
                readline.cursorTo(process.stdout, 0, undefined, () => {
                    process.stdout.write(str);
                    resolve();
                });
            });
        });
    }
    public static newline() {
        process.stdout.write('\n');
    }
}
