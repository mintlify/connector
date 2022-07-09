import { Disposable, EventEmitter, Event, extensions } from "vscode";
import { GitProvider } from "./gitProvider";
import { RepositoryChangeEvent } from "./models/repository";
import { RepositoryCloseEvent, RepositoryOpenEvent } from './gitProvider';
import { Container } from '../../container';
import { configuration } from "../../configuration";
import { GitLocation } from "./locator";
import type {
    Repository as BuiltInGitRepository,
    GitExtension,
    GitAPI as BuiltInGitApi,
} from './types';

export class LocalGitProvider implements Disposable, GitProvider {
    private _onDidChangeRepository = new EventEmitter<RepositoryChangeEvent>();
    get onDidChangeRepository(): Event<RepositoryChangeEvent> {
        return this._onDidChangeRepository.event;
    }

    private _onDidCloseRepository = new EventEmitter<RepositoryCloseEvent>();
    get onDidCloseRepository(): Event<RepositoryCloseEvent> {
        return this._onDidCloseRepository.event;
    }

    private _onDidOpenRepository = new EventEmitter<RepositoryOpenEvent>();
    get onDidOpenRepository(): Event<RepositoryOpenEvent> {
        return this._onDidOpenRepository.event;
    }

    private _disposables: Disposable[] = [];

    constructor(protected readonly container: Container, protected readonly git: Git) {
        this.git.setLocator(this.ensureGit.bind(this));
    }

    dispose() {
        Disposable.from(...this._disposables).dispose();
    }

    private _gitLocator: Promise<GitLocation> | undefined;
    private async ensureGit(): Promise<GitLocation> {
        if (this._gitLocator == null) {
            this._gitLocator = this.findGit();
        }

        return this._gitLocator;
    }

    private _scmGitApi: Promise<BuiltInGitApi | undefined> | undefined;
    private async getScmGitApi(): Promise<BuiltInGitApi | undefined> {
        return this._scmGitApi ?? (this._scmGitApi = this.getScmGitApiCore());
    }

    private async getScmGitApiCore(): Promise<BuiltInGitApi | undefined> {
        try {
            const extension = extensions.getExtension<GitExtension>('vscode.git');
            if (extension == null) return undefined;

            const gitExtension = extension.isActive ? extension.exports : await extension.activate();
            return gitExtension?.getAPI(1);
        } catch {
            return undefined;
        }
    }

    private async findGit(): Promise<GitLocation> {

        if (!configuration.getAny<boolean>('git.enabled', null, true)) {
            // Logger.log(cc, 'Built-in Git is disabled ("git.enabled": false)');
            // void Messages.showGitDisabledErrorMessage();

            // throw new UnableToFindGitError();
        }

        const scmGitPromise = this.getScmGitApi();

        async function subscribeToScmOpenCloseRepository(this: LocalGitProvider) {
            const scmGit = await scmGitPromise;
            if (scmGit == null) return;

            this._disposables.push(
                scmGit.onDidCloseRepository(e => this._onDidCloseRepository.fire({ uri: e.rootUri })),
                scmGit.onDidOpenRepository(e => this._onDidOpenRepository.fire({ uri: e.rootUri })),
            );

            for (const scmRepository of scmGit.repositories) {
                this._onDidOpenRepository.fire({ uri: scmRepository.rootUri });
            }
        }
        void subscribeToScmOpenCloseRepository.call(this);

        const potentialGitPaths =
            configuration.getAny<string | string[]>('git.path') ??
            this.container.storage.getWorkspace(WorkspaceStorageKeys.GitPath, undefined);

        const start = hrtime();

        const findGitPromise = findGitPath(potentialGitPaths);
        // Try to use the same git as the built-in vscode git extension, but don't wait for it if we find something faster
        const findGitFromSCMPromise = scmGitPromise.then(gitApi => {
            const path = gitApi?.git.path;
            if (!path) return findGitPromise;

            if (potentialGitPaths != null) {
                if (typeof potentialGitPaths === 'string') {
                    if (path === potentialGitPaths) return findGitPromise;
                } else if (potentialGitPaths.includes(path)) {
                    return findGitPromise;
                }
            }

            return findGitPath(path, false);
        });

        const location = await any<GitLocation>(findGitPromise, findGitFromSCMPromise);
        // Save the found git path, but let things settle first to not impact startup performance
        setTimeout(() => {
            void this.container.storage.storeWorkspace(WorkspaceStorageKeys.GitPath, location.path);
        }, 1000);



        // Warn if git is less than v2.7.2
        // if (compare(fromString(location.version), fromString('2.7.2')) === -1) {
        //     // Logger.log(cc, `Git version (${location.version}) is outdated`);
        //     void Messages.showGitVersionUnsupportedErrorMessage(location.version, '2.7.2');
        // }

        return location;
    }
}