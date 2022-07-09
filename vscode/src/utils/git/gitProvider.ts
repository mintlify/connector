import { Disposable, Event, Uri } from "vscode";
import { RepositoryChangeEvent } from "./models/repository";

export interface RepositoryCloseEvent {
    readonly uri: Uri;
}

export interface RepositoryOpenEvent {
    readonly uri: Uri;
}

export interface GitProvider extends Disposable {
    get onDidChangeRepository(): Event<RepositoryChangeEvent>;
    get onDidCloseRepository(): Event<RepositoryCloseEvent>;
    get onDidOpenRepository(): Event<RepositoryOpenEvent>;
}