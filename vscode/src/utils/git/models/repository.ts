import { Disposable, EventEmitter, Event, Uri } from 'vscode';

export const enum RepositoryChange {
    // FileSystem = 'filesystem',
    Unknown = 'unknown',

    // No file watching required
    Closed = 'closed',
    Ignores = 'ignores',
    Starred = 'starred',

    // File watching required
    CherryPick = 'cherrypick',
    Config = 'config',
    Heads = 'heads',
    Index = 'index',
    Merge = 'merge',
    Rebase = 'rebase',
    Remotes = 'remotes',
    RemoteProviders = 'providers',
    Stash = 'stash',
    /*
     * Union of Cherry, Merge, and Rebase
     */
    Status = 'status',
    Tags = 'tags',
    Worktrees = 'worktrees',
}

export const enum RepositoryChangeComparisonMode {
    Any,
    All,
    Exclusive,
}

export class RepositoryChangeEvent {
    private readonly _changes: Set<RepositoryChange>;

    constructor(public readonly repository: Repository, changes: RepositoryChange[]) {
        this._changes = new Set(changes);
    }
}

export interface RepositoryFileSystemChangeEvent {
    readonly repository?: Repository;
    readonly uris: Uri[];
}

export class Repository implements Disposable {
    private _onDidChange = new EventEmitter<RepositoryChangeEvent>();
    get onDidChange(): Event<RepositoryChangeEvent> {
        return this._onDidChange.event;
    }

    private _onDidChangeFileSystem = new EventEmitter<RepositoryFileSystemChangeEvent>();
    get onDidChangeFileSystem(): Event<RepositoryFileSystemChangeEvent> {
        return this._onDidChangeFileSystem.event;
    }

    readonly formattedName: string;
    readonly id: string;
    readonly index: number;
    readonly name: string;

    private readonly _disposable: Disposable;
}