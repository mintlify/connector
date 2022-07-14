import * as vscode from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { CodeReturned } from '../../mintlify-functionality/treeviews/connections';
import { command } from '../../system/command';
import { Command } from '../base';

export interface HighlightConnectionArgs {
	code?: CodeReturned;
}
@command()
export class HighlightConnection extends Command {
	constructor(private readonly container: Container) {
		super(Commands.HighlightConnection);
	}

	async execute(args?: HighlightConnectionArgs) {
		if (args?.code?.line != null && args?.code?.endLine != null) {
			const rootPath = vscode.workspace.workspaceFolders![0].uri.path;
			const filePathUri = vscode.Uri.parse(`${rootPath}/${args?.code.file}`);
			const selectedRange = new vscode.Range(args?.code.line, 0, args?.code.endLine, 9999);
			vscode.window.activeTextEditor?.revealRange(selectedRange);
			await vscode.window.showTextDocument(filePathUri, {
				selection: selectedRange,
				preserveFocus: true,
			});
		}
	}
}
