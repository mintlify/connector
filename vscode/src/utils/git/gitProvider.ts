import { Disposable, Event, Uri } from "vscode";
import { RepositoryChangeEvent } from "./models/repository";
import { GitUri } from './gitUri';

export const enum GitProviderId {
    Git = 'git',
    GitHub = 'github',
    Vsls = 'vsls',
}

export interface GitProviderDescriptor {
    readonly id: GitProviderId;
    readonly name: string;
}

export interface PreviousComparisonUrisResult {
    current: GitUri;
    previous: GitUri | undefined;
}

export interface PreviousLineComparisonUrisResult extends PreviousComparisonUrisResult {
    line: number;
}

export interface RepositoryCloseEvent {
    readonly uri: Uri;
}

export interface RepositoryOpenEvent {
    readonly uri: Uri;
}

export interface RepositoryInitWatcher extends Disposable {
    readonly onDidCreate: Event<Uri>;
}

export interface GitProvider extends Disposable {
    get onDidChangeRepository(): Event<RepositoryChangeEvent>;
    get onDidCloseRepository(): Event<RepositoryCloseEvent>;
    get onDidOpenRepository(): Event<RepositoryOpenEvent>;

    readonly descriptor: GitProviderDescriptor;
    readonly supportedSchemes: Set<string>;

    openRepositoryInitWatcher?(): RepositoryInitWatcher;
}

export interface RevisionUriData {
    ref?: string;
    repoPath: string;
}