import axios from 'axios';
import { Disposable, TreeView, window } from 'vscode';
import * as vscode from 'vscode';
import { Container } from '../../container';
import { once } from '../../system/event';
import { API_ENDPOINT } from '../utils/api';
import { Code } from '../utils/git';
import { Doc } from '../utils/types';

export type CodeReturned = Code & { doc: Doc };

export class TeamTreeProvider implements vscode.TreeDataProvider<Account>, Disposable {
	protected disposables: Disposable[] = [];
	protected tree: TreeView<Account> | undefined;

	private _onDidChangeTreeData: vscode.EventEmitter<Account | undefined | null | void> = new vscode.EventEmitter<
		Account | undefined | null | void
	>();
	readonly onDidChangeTreeData: vscode.Event<Account | undefined | null | void> = this._onDidChangeTreeData.event;

	constructor(private readonly container: Container) {
		this.disposables.push(once(container.onReady)(this.onReady, this));
	}

	private onReady() {
		this.initialize();
	}

	protected initialize() {
		this.tree = window.createTreeView<Account>('teammates', {
			treeDataProvider: this,
		});
		this.disposables.push(this.tree);
	}

	dispose() {
		Disposable.from(...this.disposables).dispose();
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Account): vscode.TreeItem {
		return element;
	}

	async getChildren(): Promise<any[]> {
		const authParams = await this.container.storage.getAuthParams();

		if (authParams?.userId == null) {
			return [new NotLoggedIn()];
		}

		const {
			data: { users },
		} = await axios.get(`${API_ENDPOINT}/org/users`, {
			params: authParams,
		});

		const currentUser = await users.find((user: any) => user.userId === authParams?.userId);
		const allOtherMembers = users.filter((user: any) => user?.email !== currentUser?.email);

		return [
			new Account(currentUser?.email, false, true),
			...allOtherMembers.map((user: any) => new Account(user?.email, user?.pending)),
			new InviteMember(),
		];
	}
}

class Account extends vscode.TreeItem {
	constructor(public readonly email: string, public readonly isPending?: boolean, public readonly isSelf?: boolean) {
		super(email, vscode.TreeItemCollapsibleState.None);
		this.tooltip = this.email;
		if (isSelf) {
			this.description = 'Me';
		} else if (isPending) {
			this.description = 'Pending';
			this.contextValue = 'member';
		} else {
			this.contextValue = 'member';
		}
		this.iconPath = new vscode.ThemeIcon('account');
	}
}

class InviteMember extends vscode.TreeItem {
	constructor() {
		super('Invite team member', vscode.TreeItemCollapsibleState.None);
		this.tooltip = 'Invite team member';
		this.description = '';

		const onClickCommand: vscode.Command = {
			title: 'Invite team member',
			command: 'mintlify.invite-member',
		};

		this.iconPath = new vscode.ThemeIcon('person-add');
		this.command = onClickCommand;
	}
}

class NotLoggedIn extends vscode.TreeItem {
	constructor() {
		super('Invite team member', vscode.TreeItemCollapsibleState.None);
		this.tooltip = 'Invite team member';
		this.description = 'login required';

		this.iconPath = new vscode.ThemeIcon('person-add');

		const onClickCommand: vscode.Command = {
			title: 'Sign in',
			command: 'mintlify.login',
		};

		this.command = onClickCommand;
	}
}
