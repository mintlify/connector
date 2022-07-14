import * as vscode from 'vscode';
import { Commands } from '../constants';
import { executeCommand } from '../system/command';
import {
	highlightConnectionCommand,
	inviteTeamMemberCommand,
	openDocsCommand,
	openPreviewCommand,
	refreshLinksCommand,
	removeTeamMemberCommand,
} from './commands';
import { createTreeViews } from './treeviews';
import { GlobalState } from './utils/globalState';

export function mintlifyActivate(context: vscode.ExtensionContext) {
	const globalState = new GlobalState(context.globalState);

	context.subscriptions.push(
		refreshLinksCommand(globalState),
		openDocsCommand(),
		openPreviewCommand(globalState),
		highlightConnectionCommand(),
		inviteTeamMemberCommand(globalState),
		removeTeamMemberCommand(globalState),
	);

	vscode.window.onDidChangeTextEditorSelection(async () => {
		await executeCommand(Commands.LinkCode);
	});

	createTreeViews(globalState);
}
