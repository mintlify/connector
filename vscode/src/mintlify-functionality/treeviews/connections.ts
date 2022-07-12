import * as vscode from 'vscode';
import * as path from 'path';
import GlobalState from '../utils/globalState';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import { Code, getRepoInfo } from '../utils/git';
import { Doc } from '../viewProvider';

export type CodeReturned = Code & { doc: Doc };

export class ConnectionsTreeProvider implements vscode.TreeDataProvider<Connection> {
	private state: GlobalState;
	private _onDidChangeTreeData: vscode.EventEmitter<Connection | undefined | null | void> = new vscode.EventEmitter<
		Connection | undefined | null | void
	>();
	readonly onDidChangeTreeData: vscode.Event<Connection | undefined | null | void> = this._onDidChangeTreeData.event;

	constructor(state: GlobalState) {
		this.state = state;
	}

	getTreeItem(element: Connection): vscode.TreeItem {
		return element;
	}

	async getChildren(): Promise<any[]> {
		const editor = vscode.window.activeTextEditor;
		let gitOrg, file, repo;
		if (editor) {
			const fileFsPath: string = editor.document.uri.fsPath;
			const { gitOrg: activeGitOrg, repo: activeRepo, file: activeFile } = await getRepoInfo(fileFsPath);
			[gitOrg, file, repo] = [activeGitOrg, activeFile, activeRepo];
		}

		try {
			const {
				data: { codes },
			} = await axios.get(`${API_ENDPOINT}/links`, {
				params: {
					...this.state.getAuthParams(),
					gitOrg,
					file,
					repo,
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
