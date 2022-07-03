import * as vscode from 'vscode';
import * as path from 'path';
import GlobalState from '../utils/globalState';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';

type Doc = {
  _id: string,
  title: string,
  lastUpdatedAt: string,
  createdAt: string,
  url: string,
  content: string,
  code: any[],
  favicon?: string,
  method: string,
  slack?: boolean,
  email?: boolean,
};

type Group = {
  _id: string;
  name: string;
  count: number;
  lastUpdatedDoc: Doc;
  tasksCount: number;
  isLoading: boolean;
};

export class ConnectionsTreeProvider implements vscode.TreeDataProvider<GroupOption> {
  private state: GlobalState;

  constructor(state: GlobalState) {
    this.state = state;
  }

  getTreeItem(element: GroupOption): vscode.TreeItem {
    return element;
  }

  async getChildren(groupElement: GroupOption): Promise<GroupOption[]> {
    const userId = this.state.getUserId();
    if (!userId) {
      return [];
    }

    const subdomain = this.state.getSubdomain();

    if (groupElement) {
      const { data: { docs }  } = await axios.get(`${API_ENDPOINT}/docs/method/${groupElement.group._id}`, {
        params: {
          userId,
          subdomain
        }
      });
      return docs.map((doc) => new DocOption(doc, vscode.TreeItemCollapsibleState.None));
    }

    const { data: { groups }  } = await axios.get(`${API_ENDPOINT}/docs/groups`, {
      params: {
        userId,
        subdomain
      }
    });

    return [...groups.map((group) => new GroupOption(group, vscode.TreeItemCollapsibleState.Collapsed)), new AddDocOption()];
  }
}

class GroupOption extends vscode.TreeItem {
  constructor(
    public readonly group: Group,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(group.name, collapsibleState);
    this.tooltip = this.group.name;
    this.description = `${this.group.count} documents`;
    this.iconPath = getIconPathForGroup(group._id);
    // const onClickCommand: vscode.Command = {
    //   title: 'Hotkey Config',
    //   command: 'docs.hotkeyConfig',
    //   arguments: [this.label]
    // };

    // this.command = onClickCommand;
  }
}

class DocOption extends vscode.TreeItem {
  constructor(
    public readonly doc: Doc,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(doc.title, collapsibleState);
    this.tooltip = this.doc.title;
    this.iconPath = {
      light: path.join(__filename, '..', '..', 'assets', 'icons', 'document.svg'),
      dark: path.join(__filename, '..', '..', 'assets', 'icons', 'document-dark.svg'),
    };
  }
}

class AddDocOption extends vscode.TreeItem {
  constructor() {
    super('', vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = '';
    this.description = 'Add new document';
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