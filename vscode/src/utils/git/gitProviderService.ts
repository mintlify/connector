import { Disposable, workspace, WorkspaceFolder } from "vscode";
import { GitProvider, GitProviderId } from "./gitProvider";
import { Repository } from './models';
import { flatMap, filter, count } from "../system/iterable";
import { Repositories } from "../../repositories";

export class GitProviderService extends Disposable {
    private readonly _providers = new Map<GitProviderId, GitProvider>();
    readonly supportedSchemes = new Set<string>();
    private readonly _repositories = new Repositories();

    private _discoveredWorkspaceFolders = new Map<WorkspaceFolder, Promise<Repository[]>>();
    private _initializing: boolean = true;

    get openRepositoryCount(): number {
		return count(this.repositories, r => !r.closed);
	}

	get repositories(): IterableIterator<Repository> {
		return this._repositories.values();
	}

    private updateContext() {
		const hasRepositories = this.openRepositoryCount !== 0;
		void this.setEnabledContext(hasRepositories);

		// Don't bother trying to set the values if we're still starting up
		if (!hasRepositories && this._initializing) return;

		// Don't block for the remote context updates (because it can block other downstream requests during initialization)
		async function updateRemoteContext(this: GitProviderService) {
			let hasRemotes = false;
			let hasRichRemotes = false;
			let hasConnectedRemotes = false;
			if (hasRepositories) {
				for (const repo of this._repositories.values()) {
					if (!hasConnectedRemotes) {
						hasConnectedRemotes = await repo.hasRichRemote(true);

						if (hasConnectedRemotes) {
							hasRichRemotes = true;
							hasRemotes = true;
						}
					}

					if (!hasRichRemotes) {
						hasRichRemotes = await repo.hasRichRemote();

						if (hasRichRemotes) {
							hasRemotes = true;
						}
					}

					if (!hasRemotes) {
						hasRemotes = await repo.hasRemotes();
					}

					if (hasRemotes && hasRichRemotes && hasConnectedRemotes) break;
				}
			}

			await Promise.all([
				setContext(ContextKeys.HasRemotes, hasRemotes),
				setContext(ContextKeys.HasRichRemotes, hasRichRemotes),
				setContext(ContextKeys.HasConnectedRemotes, hasConnectedRemotes),
			]);
		}

		void updateRemoteContext.call(this);

		this._providers.forEach(p => p.updateContext?.());
	}

    private _context: { enabled: boolean; disabled: boolean } = { enabled: false, disabled: false };

    async setEnabledContext(enabled: boolean): Promise<void> {
		let disabled = !enabled;
		// If we think we should be disabled during startup, check if we have a saved value from the last time this repo was loaded
		if (!enabled && this._initializing) {
			disabled = !(
				this.container.storage.getWorkspace<boolean>(WorkspaceStorageKeys.AssumeRepositoriesOnStartup) ?? true
			);
		}

		if (this._context.enabled === enabled && this._context.disabled === disabled) return;

		const promises = [];

		if (this._context.enabled !== enabled) {
			this._context.enabled = enabled;
			promises.push(setContext(ContextKeys.Enabled, enabled));
		}

		if (this._context.disabled !== disabled) {
			this._context.disabled = disabled;
			promises.push(setContext(ContextKeys.Disabled, disabled));
		}

		await Promise.all(promises);

		if (!this._initializing) {
			void this.container.storage.storeWorkspace(WorkspaceStorageKeys.AssumeRepositoriesOnStartup, enabled);
		}
	}

    async discoverRepositories(folders: readonly WorkspaceFolder[], options?: { force?: boolean }): Promise<void> {
        const promises: Promise<Repository[]>[] = [];

        for (const folder of folders) {
            if (!options?.force && this._discoveredWorkspaceFolders.has(folder)) continue;

            const promise: Promise<Repository[]> = this.discoverRepositoriesCore(folder);
            promises.push(promise);
            this._discoveredWorkspaceFolders.set(folder, promise);
        }

        if (promises.length === 0) return;

        const results = await Promise.allSettled(promises);

        const repositories = flatMap<PromiseFulfilledResult<Repository[]>, Repository>(
            filter<PromiseSettledResult<Repository[]>, PromiseFulfilledResult<Repository[]>>(
                results,
                (r): r is PromiseFulfilledResult<Repository[]> => r.status === 'fulfilled',
            ),
            r => r.value,
        );

        const added: Repository[] = [];

        for (const repository of repositories) {
            if (this._repositories.add(repository)) {
                added.push(repository);
            }
        }

        this.updateContext();

        if (added.length === 0) return;

        // Defer the event trigger enough to let everything unwind
        queueMicrotask(() => this.fireRepositoriesChanged(added));
    }

    private async discoverRepositoriesCore(folder: WorkspaceFolder): Promise<Repository[]> {
        const { provider } = this.getProvider(folder.uri);

        try {
            return await provider.discoverRepositories(folder.uri);
        } catch (ex) {
            this._discoveredWorkspaceFolders.delete(folder);

            Logger.error(
                ex,
                `${provider.descriptor.name} Provider(${provider.descriptor.id
                }) failed discovering repositories in ${folder.uri.toString(true)}`,
            );

            return [];
        }
    }

    /**
     * Registers a {@link GitProvider}
     * @param id A unique indentifier for the provider
     * @param name A name for the provider
     * @param provider A provider for handling git operations
     * @returns A disposable to unregister the {@link GitProvider}
     */
    register(id: GitProviderId, provider: GitProvider): Disposable {
        if (id !== provider.descriptor.id) {
            throw new Error(`Id '${id}' must match provider id '${provider.descriptor.id}'`);
        }
        if (this._providers.has(id)) throw new Error(`Provider '${id}' has already been registered`);

        this._providers.set(id, provider);
        for (const scheme of provider.supportedSchemes) {
            this.supportedSchemes.add(scheme);
        }

        const disposables: Disposable[] = [];

        const watcher = provider.openRepositoryInitWatcher?.();
        if (watcher != null) {
            disposables.push(
                watcher,
                watcher.onDidCreate(uri => {
                    const f = workspace.getWorkspaceFolder(uri);
                    if (f == null) return;

                    void this.discoverRepositories([f], { force: true });
                }),
            );
        }

        const disposable = Disposable.from(
            provider,
            ...disposables,
            provider.onDidChangeRepository(e => {
                if (
                    e.changed(
                        RepositoryChange.Remotes,
                        RepositoryChange.RemoteProviders,
                        RepositoryChangeComparisonMode.Any,
                    )
                ) {
                    this._richRemotesCache.clear();
                }

                if (e.changed(RepositoryChange.Closed, RepositoryChangeComparisonMode.Any)) {
                    this.updateContext();

                    // Send a notification that the repositories changed
                    queueMicrotask(() => this.fireRepositoriesChanged([], [e.repository]));
                }

                this._visibilityCache.delete(e.repository.path);
                this._onDidChangeRepository.fire(e);
            }),
            provider.onDidCloseRepository(e => {
                const repository = this._repositories.get(e.uri);
                if (repository != null) {
                    repository.closed = true;
                }
            }),
            provider.onDidOpenRepository(e => {
                const repository = this._repositories.get(e.uri);
                if (repository != null) {
                    repository.closed = false;
                } else {
                    void this.getOrOpenRepository(e.uri);
                }
            }),
        );

        this.fireProvidersChanged([provider]);

        // Don't kick off the discovery if we're still initializing (we'll do it at the end for all "known" providers)
        if (!this._initializing) {
            this.onWorkspaceFoldersChanged({ added: workspace.workspaceFolders ?? [], removed: [] });
        }

        return {
            dispose: () => {
                disposable.dispose();
                this._providers.delete(id);

                const removed: Repository[] = [];

                for (const repository of [...this._repositories.values()]) {
                    if (repository?.provider.id === id) {
                        this._repositories.remove(repository.uri);
                        removed.push(repository);
                    }
                }

                this.updateContext();

                if (removed.length) {
                    // Defer the event trigger enough to let everything unwind
                    queueMicrotask(() => {
                        this.fireRepositoriesChanged([], removed);
                        removed.forEach(r => r.dispose());
                    });
                }

                this.fireProvidersChanged([], [provider]);
            },
        };
    }
}