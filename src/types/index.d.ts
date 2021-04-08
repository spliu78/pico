declare interface PicoOption {
    mode?: import('./enum').ClassifyWay,
    timeMode?: import('./enum').FileTimeModeString,
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
    status: import('./enum').ExecStatusString,
    destName?: string,
    destDir?: string
}