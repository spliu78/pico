export enum ClassifyWay {
    cut, copy, test
}

export enum ExecStatus {
    hashRepeat,
    create,
    conflict
}

export type ExecStatusString = keyof typeof ExecStatus;

export enum FileTimeMode {
    access = 'access',
    create = 'create',
    modify = 'modify',
    birth = 'birth'
}