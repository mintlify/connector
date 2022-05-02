export type Change = {
    type: 'add' | 'delete';
    line: number;
    content: string;
}

export type ConnectFile = {
    filename: string;
    content: string;
    changes: Change[];
}

export type LineRange = {
    start: number;
    end: number;
}

export type Alert = {
    url: string;
    message: string;
    filename: string;
    lineRange: LineRange;
    type: string;
}
  
export type Link = {
    url: string;
    lineRange: LineRange;
    type: string;
}

export type AlertsRequest = {
    files: ConnectFile[],
    owner: string,
    repo: string,
    pullNumber: number,
    installationId?: number,
}