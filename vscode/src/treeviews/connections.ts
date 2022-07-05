import * as vscode from 'vscode';
import * as path from 'path';
import GlobalState from '../utils/globalState';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import { Code, getRepoInfo } from '../utils/git';
import { Doc } from '../components/viewProvider';

export type CodeReturned = Code & { doc: Doc };

export class ConnectionsTreeProvider implements vscode.TreeDataProvider<ConnectionIcon> {
  private state: GlobalState;
  private _onDidChangeTreeData: vscode.EventEmitter<ConnectionIcon | undefined | null | void> = new vscode.EventEmitter<ConnectionIcon | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ConnectionIcon | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(state: GlobalState) {
    this.state = state;
  }

  getTreeItem(element: ConnectionIcon): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<any[]> {
    const userId = this.state.getUserId();
    if (!userId) {
      return [];
    }

    const subdomain = this.state.getSubdomain();

    const editor = vscode.window.activeTextEditor;
    let gitOrg, file, repo;
    if (editor) {
      const fileFsPath: string = editor.document.uri.fsPath;
      const { gitOrg: activeGitOrg, repo: activeRepo, file: activeFile } = await getRepoInfo(fileFsPath);
      [gitOrg, file, repo] = [activeGitOrg, activeFile, activeRepo];
    }

    const { data: { codes }  } = await axios.get(`${API_ENDPOINT}/links`, {
      params: {
        userId,
        subdomain,
        gitOrg,
        file,
        repo
      }
    });

    if (codes.length === 0) {
      return [new EmptyListIcon()];
    }

    return [...codes.map((code) => new ConnectionIcon(code))];
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class ConnectionIcon extends vscode.TreeItem {
  constructor(
    public readonly code: CodeReturned,
  ) {
    super(code.doc.title, vscode.TreeItemCollapsibleState.None);
    this.tooltip = this.code.doc.title;
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'assets', 'icons', 'connect.svg'),
      dark: path.join(__filename, '..', '..', 'assets', 'icons', 'connect-dark.svg'),
    };

    const onClickCommand: vscode.Command = {
      title: 'Highlight connection',
      command: 'mintlify.highlight-connection',
      arguments: [this.code]
    };

    this.command = onClickCommand;
  }
}

class EmptyListIcon extends vscode.TreeItem {
  constructor() {
    super('No connections for this file', vscode.TreeItemCollapsibleState.None);
    this.tooltip = 'No connections for this file';
  }
}