import { ExtensionContext, Event, EventEmitter } from "vscode";
import { configuration } from "./configuration";
import { Config } from './config';
import { GitProviderService } from './utils/git/gitProviderService';
import { Storage } from "./storage";

export class Container {
    static #instance: Container | undefined;
    static #proxy = new Proxy<Container>({} as Container, {
        get: function (target, prop) {
            // In case anyone has cached this instance
            if (Container.#instance != null) return (Container.#instance as any)[prop];

            // Allow access to config before we are initialized
            if (prop === 'config') return configuration.get();

            // debugger;
            throw new Error('Container is not initialized');
        },
    });

    static create(context: ExtensionContext, cfg: Config) {
        if (Container.#instance != null) throw new Error('Container is already initialized');

        Container.#instance = new Container(context, cfg);
        return Container.#instance;
    }

    static get instance(): Container {
        return Container.#instance ?? Container.#proxy;
    }

    private _onReady: EventEmitter<void> = new EventEmitter<void>();
    get onReady(): Event<void> {
        return this._onReady.event;
    }

    private constructor(context: ExtensionContext, config: Config) {
        this._context = context;
    }

    private _ready: boolean = false;

    async ready() {
        if (this._ready) throw new Error('Container is already ready');

        this._ready = true;
        await this.registerGitProviders();
        queueMicrotask(() => this._onReady.fire());
    }

    private async registerGitProviders() {
        const providers = await getSupportedGitProviders(this);
        for (const provider of providers) {
            this._context.subscriptions.push(this._git.register(provider.descriptor.id, provider));
        }

        this._git.registrationComplete();
    }

    private _context: ExtensionContext;
    get context() {
        return this._context;
    }

    private _git: GitProviderService;
    get git() {
        return this._git;
    }

    private readonly _storage: Storage;
    get storage(): Storage {
        return this._storage;
    }
}