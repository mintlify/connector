import * as vscode from 'vscode';
import * as path from 'path';

// Options must also match contributes.properties in package.json
const HOTKEY_OPTIONS_MAC = [
  '⌘ + .',
  '⌥ + .',
];

export class ConnectionsTreeProvider implements vscode.TreeDataProvider<HotkeyOption> {
  constructor() {}

  getTreeItem(element: HotkeyOption): vscode.TreeItem {
    return element;
  }

  getChildren(): HotkeyOption[] {
    return [new HotkeyOption('Heyyo', vscode.TreeItemCollapsibleState.None)];
  }
}

class HotkeyOption extends vscode.TreeItem {
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