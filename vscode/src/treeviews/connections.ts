import * as vscode from 'vscode';
import * as path from 'path';
import GlobalState from '../utils/globalState';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';

export class ConnectionsTreeProvider implements vscode.TreeDataProvider<GroupOption> {
  private state: GlobalState;

  constructor(state: GlobalState) {
    this.state = state;
  }

  getTreeItem(element: GroupOption): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<GroupOption[]> {
    const userId = this.state.getUserId();
    if (!userId) {
      return [];
    }

    const subdomain = this.state.getSubdomain();
    const { data: { groups }  } = await axios.get(`${API_ENDPOINT}/docs/groups`, {
      params: {
        userId,
        subdomain
      }
    });

    return groups.map((group) => {
      return new GroupOption(group.name, vscode.TreeItemCollapsibleState.None);
    });
  }
}

class GroupOption extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly isDefault: boolean = false,
    public readonly selected: boolean = false
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    if (this.isDefault) {
      this.description = 'Default';
    }

    if (this.selected) {
      this.iconPath = {
        light: path.join(__filename, '..', '..', 'assets', 'light', 'check.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'dark', 'check.svg')
      };
    }
    const onClickCommand: vscode.Command = {
      title: 'Hotkey Config',
      command: 'docs.hotkeyConfig',
      arguments: [this.label]
    };

    this.command = onClickCommand;
  }
}