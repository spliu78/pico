#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const Pico_1 = require("./Pico");
const enum_1 = require("./types/enum");
const program = new commander_1.Command();
program.version('0.0.1');
// pico copy -f <from> -t <to> -r -o -e a,b,c -p
const copyCommand = program.command('copy').description('copy files');
const testCommand = program.command('test').description('test which file is choosen');
[copyCommand, testCommand].forEach((command) => {
    command.requiredOption('-f, --from <dir-path>', 'input dir path');
    command.requiredOption('-t, --to <dir-path>', 'output dir path');
    command.addOption(new commander_1.Option('-d, --date-type <type>', 'choose a date-type to classify files')
        .choices(['modify', 'create', 'birth', 'access']).default('modify'));
    // command.option('-d, --date-type', 'choose a date-type to classify files: [modify | create | birth | access], "modify" by default ', 'modify')
    command.option('-r, --recursive', 'recursive');
    command.option('-o, --override', 'override');
    command.option('-e, --extnames <name-string>', 'only move/copy matched files, split with ","  like: .mp3,.mp4,.avi');
    command.option('-p, --piconly', 'only move/copy matched pic, support: .gif,.jpeg,.jpg,.png. Can also work with -e');
    // command.option('--no-log', 'pico without log');
});
const optionsHandler = (options) => {
    const opt = {
        recursive: options.recursive || false,
        override: options.override || false,
        extnames: options.extnames ? options.extnames.split(',') : [],
        picOnly: options.picOnly || false,
        timeMode: options.dateType
    };
    return opt;
};
copyCommand.action(async (options) => {
    const picOpt = optionsHandler(options);
    picOpt.mode = enum_1.ClassifyWay.copy;
    const p = new Pico_1.Pico(options.from, options.to, picOpt);
    await p.process();
});
testCommand.action(async (options) => {
    const picOpt = optionsHandler(options);
    picOpt.mode = enum_1.ClassifyWay.test;
    const p = new Pico_1.Pico(options.from, options.to, picOpt);
    await p.process();
});
program.parse();
// (async () => {
// const picOpt: PicoOption = {};
// picOpt.mode = ClassifyWay.test;
// const p = new Pico('.', './test', picOpt);
// await p.process();
// })();
//# sourceMappingURL=index.js.map