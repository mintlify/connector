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
      return new GroupOption(group.name, group._id, vscode.TreeItemCollapsibleState.None);
    });
  }
}

const getIconPathForGroup = (id: string): string | { light: string, dark: string } => {
  switch (id) {
    case 'github':
      return {
        light: path.join(__filename, '..', '..', 'assets', 'icons', 'github.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'icons', 'github-dark.svg')
      };
    case 'notion-private':
      return {
        light: path.join(__filename, '..', '..', 'assets', 'icons', 'notion.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'icons', 'notion-dark.svg'),
      };
    case 'googledocs-private':
      return {
        light: path.join(__filename, '..', '..', 'assets', 'icons', 'google-docs.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'icons', 'google-docs.svg'),
      };
    case 'confluence-private':
      return {
        light: path.join(__filename, '..', '..', 'assets', 'icons', 'confluence.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'icons', 'confluence.svg'),
      };
    case 'web':
      return {
        light: path.join(__filename, '..', '..', 'assets', 'icons', 'web.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'icons', 'web-dark.svg'),
      };
    default:
      return '';
  }
};

class GroupOption extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly isDefault: boolean = false,
    public readonly selected: boolean = false
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    if (this.isDefault) {
      this.description = 'Default';
    }

    this.iconPath = getIconPathForGroup(id);
    // const onClickCommand: vscode.Command = {
    //   title: 'Hotkey Config',
    //   command: 'docs.hotkeyConfig',
    //   arguments: [this.label]
    // };

    // this.command = onClickCommand;
  }
}