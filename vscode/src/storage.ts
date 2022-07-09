import { Disposable, Event, EventEmitter, ExtensionContext, SecretStorageChangeEvent } from 'vscode';
import type { ViewShowBranchComparison } from './config';

export class Storage implements Disposable {
    private _onDidChangeSecrets = new EventEmitter<SecretStorageChangeEvent>();
    get onDidChangeSecrets(): Event<SecretStorageChangeEvent> {
        return this._onDidChangeSecrets.event;
    }

    private readonly _disposable: Disposable;
    constructor(private readonly context: ExtensionContext) {
        this._disposable = this.context.secrets.onDidChange(e => this._onDidChangeSecrets.fire(e));
    }

    dispose(): void {
        this._disposable.dispose();
    }

    get<T>(key: StorageKeys | SyncedStorageKeys): T | undefined;
    get<T>(key: StorageKeys | SyncedStorageKeys, defaultValue: T): T;
    get<T>(key: StorageKeys | SyncedStorageKeys, defaultValue?: T): T | undefined {
        return this.context.globalState.get(key, defaultValue);
    }

    async delete(key: StorageKeys | SyncedStorageKeys): Promise<void> {
        return this.context.globalState.update(key, undefined);
    }

    async store<T>(key: StorageKeys | SyncedStorageKeys, value: T): Promise<void> {
        return this.context.globalState.update(key, value);
    }

    async getSecret(key: SecretKeys): Promise<string | undefined> {
        return this.context.secrets.get(key);
    }

    async deleteSecret(key: SecretKeys): Promise<void> {
        return this.context.secrets.delete(key);
    }

    async storeSecret(key: SecretKeys, value: string): Promise<void> {
        return this.context.secrets.store(key, value);
    }

    getWorkspace<T>(key: WorkspaceStorageKeys | `${WorkspaceStorageKeys.ConnectedPrefix}${string}`): T | undefined;
    getWorkspace<T>(key: WorkspaceStorageKeys | `${WorkspaceStorageKeys.ConnectedPrefix}${string}`, defaultValue: T): T;
    getWorkspace<T>(
        key: WorkspaceStorageKeys | `${WorkspaceStorageKeys.ConnectedPrefix}${string}`,
        defaultValue?: T,
    ): T | undefined {
        return this.context.workspaceState.get(key, defaultValue);
    }

    async deleteWorkspace(
        key: WorkspaceStorageKeys | `${WorkspaceStorageKeys.ConnectedPrefix}${string}`,
    ): Promise<void> {
        return this.context.workspaceState.update(key, undefined);
    }

    async storeWorkspace<T>(
        key: WorkspaceStorageKeys | `${WorkspaceStorageKeys.ConnectedPrefix}${string}`,
        value: T,
    ): Promise<void> {
        return this.context.workspaceState.update(key, value);
    }
}

export type SecretKeys = string;

// TODO - change these to mintlify
export const enum StorageKeys {
    Avatars = 'gitlens:avatars',
    PendingWelcomeOnFocus = 'gitlens:pendingWelcomeOnFocus',
    PendingWhatsNewOnFocus = 'gitlens:pendingWhatsNewOnFocus',
    HomeViewActionsCompleted = 'gitlens:home:actions:completed',

    Version = 'gitlens:version',

    MigratedAuthentication = 'gitlens:plus:migratedAuthentication',
    Subscription = 'gitlens:premium:subscription', // Don't change this key name as its the stored subscription

    Deprecated_Version = 'gitlensVersion',
}

export const enum SyncedStorageKeys {
    Version = 'gitlens:synced:version',
    HomeViewWelcomeVisible = 'gitlens:views:welcome:visible',

    Deprecated_DisallowConnectionPrefix = 'gitlens:disallow:connection:',
}

export const enum WorkspaceStorageKeys {
    AssumeRepositoriesOnStartup = 'gitlens:assumeRepositoriesOnStartup',
    GitPath = 'gitlens:gitPath',

    BranchComparisons = 'gitlens:branch:comparisons',
    ConnectedPrefix = 'gitlens:connected:',
    DefaultRemote = 'gitlens:remote:default',
    GitCommandPaletteUsage = 'gitlens:gitComandPalette:usage',
    StarredBranches = 'gitlens:starred:branches',
    StarredRepositories = 'gitlens:starred:repositories',
    ViewsRepositoriesAutoRefresh = 'gitlens:views:repositories:autoRefresh',
    ViewsSearchAndCompareKeepResults = 'gitlens:views:searchAndCompare:keepResults',
    ViewsSearchAndComparePinnedItems = 'gitlens:views:searchAndCompare:pinned',

    Deprecated_DisallowConnectionPrefix = 'gitlens:disallow:connection:',
    Deprecated_PinnedComparisons = 'gitlens:pinned:comparisons',
}

export interface BranchComparison {
    ref: string;
    notation: '..' | '...' | undefined;
    type: Exclude<ViewShowBranchComparison, false> | undefined;
}

export interface BranchComparisons {
    [id: string]: string | BranchComparison;
}

export interface NamedRef {
    label?: string;
    ref: string;
}

export interface Starred {
    [id: string]: boolean;
}

export interface Usage {
    [id: string]: number;
}
