// eslint-disable-next-line no-restricted-imports
import * as path from 'path';
import axios from 'axios';
import { Disposable, TextEditor, TreeView, window } from 'vscode';
import * as vscode from 'vscode';
import { Container } from '../../container';
import { once } from '../../system/event';
import { API_ENDPOINT } from '../utils/api';
import { Code, getRepoInfo } from '../utils/git';
import { Doc } from '../utils/types';

export type CodeReturned = Code & { doc: Doc };

export class ConnectionsTreeProvider implements vscode.TreeDataProvider<Connection>, Disposable {
	protected disposables: Disposable[] = [];
	protected tree: TreeView<Connection> | undefined;

	private _onDidChangeTreeData: vscode.EventEmitter<Connection | undefined | null | void> = new vscode.EventEmitter<
		Connection | undefined | null | void
	>();
	readonly onDidChangeTreeData: vscode.Event<Connection | undefined | null | void> = this._onDidChangeTreeData.event;

	constructor(private readonly container: Container) {
		this.disposables.push(
			once(container.onReady)(this.onReady, this),
			window.onDidChangeActiveTextEditor(this.onActiveTextEditorChanged, this),
		);
	}

	private onActiveTextEditorChanged(editor: TextEditor | undefined) {
		if (editor == null) return;
		this.refresh();
	}

	private onReady() {
		this.initialize();
	}

	dispose() {
		Disposable.from(...this.disposables).dispose();
	}

	protected initialize() {
		this.tree = window.createTreeView<Connection>('connections', {
			treeDataProvider: this,
		});
		this.disposables.push(this.tree);
	}

	getTreeItem(element: Connection): vscode.TreeItem {
		return element;
	}

	async getChildren(): Promise<any[]> {
		const editor = vscode.window.activeTextEditor;
		let gitOrg;
		let file;
		let repo;
		if (editor != null) {
			const fileFsPath: string = editor.document.uri.fsPath;
			const { gitOrg: activeGitOrg, repo: activeRepo, file: activeFile } = await getRepoInfo(fileFsPath);
			[gitOrg, file, repo] = [activeGitOrg, activeFile, activeRepo];
		}

		try {
			const authParams = await this.container.storage.getAuthParams();
			const {
				data: { codes },
			} = await axios.get(`${API_ENDPOINT}/links`, {
				params: {
					...authParams,
					gitOrg: gitOrg,
					file: file,
					repo: repo,
				},
			});

			if (codes.length === 0) {
				return [new EmptyListOption()];
			}

			return [...codes.map((code: any) => new Connection(code))];
		} catch {
			return [new ErrorOption()];
		}
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}
}

class Connection extends vscode.TreeItem {
	constructor(public readonly code: CodeReturned) {
		super(code.doc.title, vscode.TreeItemCollapsibleState.None);
		this.tooltip = this.code.doc.title;
		this.iconPath = {
			light: path.join(__filename, '..', '..', 'assets', 'icons', 'connect.svg'),
			dark: path.join(__filename, '..', '..', 'assets', 'icons', 'connect-dark.svg'),
		};
		this.contextValue = 'connection';

		const onClickCommand: vscode.Command = {
			title: 'Highlight connection',
			command: 'mintlify.highlight-connection',
			arguments: [this.code],
		};

		this.command = onClickCommand;
	}
}

class EmptyListOption extends vscode.TreeItem {
	constructor() {
		super('', vscode.TreeItemCollapsibleState.None);
		this.description = 'No connections for this file';
	}
}

class ErrorOption extends vscode.TreeItem {
	constructor() {
		super('', vscode.TreeItemCollapsibleState.None);
		this.description = 'Error loading connections for this file';
	}
}
