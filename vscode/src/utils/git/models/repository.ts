import { Disposable, EventEmitter, Event, Uri, WorkspaceFolder } from 'vscode';
import { debounce } from '../../system/function';
import { Container } from '../../../container';
import { GitProviderDescriptor } from '../gitProvider';
import { join } from '../../system/iterable';

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

    toString(changesOnly: boolean = false): string {
        return changesOnly
            ? `changes=${join(this._changes, ', ')}`
            : `{ repository: ${this.repository?.name ?? ''}, changes: ${join(this._changes, ', ')} }`;
    }

    with(changes: RepositoryChange[]) {
        return new RepositoryChangeEvent(this.repository, [...this._changes, ...changes]);
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
    private _fireChangeDebounced: (() => void) | undefined = undefined;
    private _pendingRepoChange?: RepositoryChangeEvent;
    private readonly _disposable: Disposable;
    private _suspended: boolean;
    private _fsWatcherDisposable: Disposable | undefined;
    private _fsWatchCounter = 0;
    private _remotesDisposable: Disposable | undefined;
    private _repoWatcherDisposable: Disposable | undefined;

    private _updatedAt: number = 0;
    get updatedAt(): number {
        return this._updatedAt;
    }

    private _closed: boolean = false;
    get closed(): boolean {
        return this._closed;
    }
    set closed(value: boolean) {
        const changed = this._closed !== value;
        this._closed = value;
        if (changed) {
            this.fireChange(RepositoryChange.Closed);
        }
    }

    constructor(
        private readonly container: Container,
        private readonly onDidRepositoryChange: (repo: Repository, e: RepositoryChangeEvent) => void,
        public readonly provider: GitProviderDescriptor,
        public readonly folder: WorkspaceFolder | undefined,
        public readonly uri: Uri,
        public readonly root: boolean,
        suspended: boolean,
        closed: boolean = false
    ) {
        this._suspended = suspended;
        this._closed = closed;
    }

    dispose() {
        this.stopWatchingFileSystem();

        this._remotesDisposable?.dispose();
        this._repoWatcherDisposable?.dispose();
        this._disposable.dispose();
    }

    private fireChange(...changes: RepositoryChange[]) {
        this._updatedAt = Date.now();

        if (this._fireChangeDebounced == null) {
            this._fireChangeDebounced = debounce(this.fireChangeCore.bind(this), 250);
        }

        this._pendingRepoChange = this._pendingRepoChange?.with(changes) ?? new RepositoryChangeEvent(this, changes);

        this.onDidRepositoryChange(this, new RepositoryChangeEvent(this, changes));

        if (this._suspended) {
            console.log(`queueing suspended ${this._pendingRepoChange.toString(true)}`);

            return;
        }

        this._fireChangeDebounced();
    }

    private fireChangeCore() {
        const e = this._pendingRepoChange;
        if (e == null) return;

        this._pendingRepoChange = undefined;

        this._onDidChange.fire(e);
    }

    stopWatchingFileSystem(force: boolean = false) {
        if (this._fsWatcherDisposable == null) return;
        if (--this._fsWatchCounter > 0 && !force) return;

        this._fsWatchCounter = 0;
        this._fsWatcherDisposable.dispose();
        this._fsWatcherDisposable = undefined;
    }

    async getRichRemote(connectedOnly: boolean = false): Promise<GitRemote<RichRemoteProvider> | undefined> {
		return this.container.git.getRichRemoteProvider(await this.getRemotes(), {
			includeDisconnected: !connectedOnly,
		});
	}

    async hasRichRemote(connectedOnly: boolean = false): Promise<boolean> {
		const remote = await this.getRichRemote(connectedOnly);
		return remote?.provider != null;
	}

}