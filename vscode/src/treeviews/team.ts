import * as vscode from 'vscode';
import GlobalState from '../utils/globalState';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import { Code } from '../utils/git';
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
    const { data: { users }  } = await axios.get(`${API_ENDPOINT}/org/users`, {
      params: this.state.getAuthParams()
    });

    const currentUserId = this.state.getUserId();
    const currentUser = users.find((user) => user.userId === currentUserId);
    const allOtherMembers = users.filter((user) => user.email !== currentUser.email);

    return [
      new Account(currentUser.email, false, true),
      ...allOtherMembers.map((user) => new Account(user.email, user.pending)),
      new InviteMember()
    ];
  }
}

class Account extends vscode.TreeItem {
  constructor(
    public readonly email: string,
    public readonly isPending?: boolean,
    public readonly isSelf?: boolean,
  ) {
    super(email, vscode.TreeItemCollapsibleState.None);
    this.tooltip = this.email;
    if (isSelf) {
      this.description = 'Me';
    } else if (isPending) {
      this.description = 'Pending';
    }
    this.iconPath = new vscode.ThemeIcon("account");
  }
}

class InviteMember extends vscode.TreeItem {
  constructor() {
    super('', vscode.TreeItemCollapsibleState.None);
    this.tooltip = 'Invite team member';
    this.description = '+ Invite team member'

    const onClickCommand: vscode.Command = {
      title: 'Invite team member',
      command: 'mintlify.invite-member',
    };

    this.command = onClickCommand;
  }
}