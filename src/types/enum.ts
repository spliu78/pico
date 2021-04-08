export enum ClassifyWay {
    cut, copy, test
}

export enum FileTimeMode {
    access = 'access',
    create = 'create',
    modify = 'modify',
    birth = 'birth'
}

export type FileTimeModeString = keyof typeof FileTimeMode;

export enum ExecStatus {
    hashRepeat,
    create,
    conflict
}

export type ExecStatusString = keyof typeof ExecStatus;

