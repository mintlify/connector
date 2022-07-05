/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { TernarySearchTree } from './ternarySearchTree';
import { API, IGit, Repository, APIState, PublishEvent } from './types';

export const enum RefType {
	Head,
	RemoteHead,
	Tag,
}

export class GitApiImpl implements API, IGit, vscode.Disposable {
	private static _handlePool: number = 0;
	private _providers = new Map<number, IGit>();

	public get repositories(): Repository[] {
		const ret: Repository[] = [];

		this._providers.forEach(({ repositories }) => {
			if (repositories) {
				ret.push(...repositories);
			}
		});

		return ret;
	}

	public get state(): APIState | undefined {
		if (this._providers.size === 0) {
			return undefined;
		}

		for (const [, { state }] of this._providers) {
			if (state !== 'initialized') {
				return 'uninitialized';
			}
		}

		return 'initialized';
	}

	private _onDidOpenRepository = new vscode.EventEmitter<Repository>();
	readonly onDidOpenRepository: vscode.Event<Repository> = this._onDidOpenRepository.event;
	private _onDidCloseRepository = new vscode.EventEmitter<Repository>();
	readonly onDidCloseRepository: vscode.Event<Repository> = this._onDidCloseRepository.event;
	private _onDidChangeState = new vscode.EventEmitter<APIState>();
	readonly onDidChangeState: vscode.Event<APIState> = this._onDidChangeState.event;
	private _onDidPublish = new vscode.EventEmitter<PublishEvent>();
	readonly onDidPublish: vscode.Event<PublishEvent> = this._onDidPublish.event;

	private _disposables: vscode.Disposable[];
	constructor() {
		this._disposables = [];
	}

	private _updateReposContext() {
		const reposCount = Array.from(this._providers.values()).reduce((prev, current) => {
			return prev + current.repositories.length;
		}, 0);
		vscode.commands.executeCommand('setContext', 'gitHubOpenRepositoryCount', reposCount);
	}

	registerGitProvider(provider: IGit): vscode.Disposable {
		const handle = this._nextHandle();
		this._providers.set(handle, provider);

		this._disposables.push(provider.onDidCloseRepository(e => this._onDidCloseRepository.fire(e)));
		this._disposables.push(provider.onDidOpenRepository(e => {
			this._updateReposContext();
			this._onDidOpenRepository.fire(e);
		}));
		if (provider.onDidChangeState) {
			this._disposables.push(provider.onDidChangeState(e => this._onDidChangeState.fire(e)));
		}
		if (provider.onDidPublish) {
			this._disposables.push(provider.onDidPublish(e => this._onDidPublish.fire(e)));
		}

		this._updateReposContext();
		provider.repositories.forEach(repository => {
			this._onDidOpenRepository.fire(repository);
		});

		return {
			dispose: () => {
				const repos = provider?.repositories;
				if (repos && repos.length > 0) {
					repos.forEach(r => this._onDidCloseRepository.fire(r));
				}
				this._providers.delete(handle);
			},
		};
	}

	getGitProvider(uri: vscode.Uri): IGit | undefined {
		const foldersMap = TernarySearchTree.forUris<IGit>();

		this._providers.forEach(provider => {
			const repos = provider.repositories;
			if (repos && repos.length > 0) {
				for (const repository of repos) {
					foldersMap.set(repository.rootUri, provider);
				}
			}
		});

		return foldersMap.findSubstr(uri);
	}

	private _nextHandle(): number {
		return GitApiImpl._handlePool++;
	}

	dispose() {
		this._disposables.forEach(disposable => disposable.dispose());
	}
}
