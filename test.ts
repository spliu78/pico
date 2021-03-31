import readline from 'readline';

(() => {
    let str = '123321123123123123123'
    let c = 0;
    setInterval(() => {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(str + '\n');
        str = '' + c;
        c++;
    }, 1000);
})();