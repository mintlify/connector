import * as vscode from 'vscode';
import { Commands } from '../constants';
import { executeCommand } from '../system/command';
import { highlightConnectionCommand, inviteTeamMemberCommand, removeTeamMemberCommand } from './commands';
import { GlobalState } from './utils/globalState';

export function mintlifyActivate(context: vscode.ExtensionContext) {
	const globalState = new GlobalState(context.globalState);

	context.subscriptions.push(
		highlightConnectionCommand(),
		inviteTeamMemberCommand(globalState),
		removeTeamMemberCommand(globalState),
	);

	vscode.window.onDidChangeTextEditorSelection(async () => {
		await executeCommand(Commands.LinkCode);
	});
}
