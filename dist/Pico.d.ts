import moment from 'moment';
export declare enum ClassifyWay {
    cut = 0,
    copy = 1,
    test = 2
}
export declare enum FileTimeMode {
    access = "access",
    create = "create",
    modify = "modify",
    birth = "birth"
}
export interface Option {
    mode?: ClassifyWay;
    timeMode?: FileTimeMode;
    recursive?: boolean;
    override?: boolean;
    extnames?: [string];
    picOnly?: boolean;
}
interface File {
    filePath: string;
    name: string;
    time?: moment.Moment;
    hash?: string;
}
export declare class Pico {
    inputDir: string;
    outputDir: string;
    ext: Array<string>;
    option: Option;
    files: Array<File>;
    picoDataDir: string;
    constructor(inputDir: string, outputDir: string, option?: Option);
    process(): Promise<void>;
    private destroy;
    private classify;
    private genPicoData;
    private createDirIfNotExist;
    private getFiles;
    private getFilesStat;
    getDate(filePath: string): Promise<Date>;
}
export {};
//# sourceMappingURL=Pico.d.ts.map