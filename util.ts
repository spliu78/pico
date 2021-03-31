import readline from 'readline';

export class MagicLog {
    public static echo(str: string) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(str);
    }
    public static newline() {
        process.stdout.write('\n');
    }
}

export const rewriteTty = function (str: string) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(str);
}