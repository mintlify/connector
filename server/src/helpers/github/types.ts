import { FileInfo } from "./patch";

export type Change = {
    type: 'add' | 'delete';
    line: number;
    content: string;
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
    files: FileInfo[],
    owner: string,
    repo: string,
}

export type TaskRequest = {
    owner: string,
    repo: string,
    pullNumber: number,
    installationId?: number,
}