import * as vscode from 'vscode';
import * as path from 'path';
import GlobalState from '../utils/globalState';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import { Code, getRepoInfo } from '../utils/git';
import { Doc } from '../components/viewProvider';

export type CodeReturned = Code & { doc: Doc };

export class TeamTreeProvider implements vscode.TreeDataProvider<Account> {
  private state: GlobalState;
  private _onDidChangeTreeData: vscode.EventEmitter<Account | undefined | null | void> = new vscode.EventEmitter<Account | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Account | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(state: GlobalState) {
    this.state = state;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Account): vscode.TreeItem {
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

    const { data: { codes }  } = await axios.get(`${API_ENDPOINT}/links`, {
      params: {
        ...this.state.getAuthParams(),
        gitOrg,
        file,
        repo
      }
    });

    return [new Account('han@mintlify.com'), new InviteMember()];
  }
}

class Account extends vscode.TreeItem {
  constructor(
    public readonly email: string,
  ) {
    super(email, vscode.TreeItemCollapsibleState.None);
    this.tooltip = this.email;
    this.iconPath = new vscode.ThemeIcon("account");
  }
}

class InviteMember extends vscode.TreeItem {
  constructor() {
    super('', vscode.TreeItemCollapsibleState.None);
    this.tooltip = 'Invite team member';
    this.description = '+ Invite team member'
  }
}