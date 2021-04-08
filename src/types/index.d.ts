

declare interface PicoOption {
    mode?: ClassifyWay,
    timeMode?: FileTimeMode,
    recursive?: boolean,
    override?: boolean,
    extnames?: [string],
    picOnly?: boolean
}

declare interface PicoFile {
    filePath: string,
    name: string,
    hash?: string,
    time?: moment.Moment
}


declare interface ExecType {
    file: PicoFile,
    status: ExecStatusString,
    destName?: string,
    destDir?: string
}