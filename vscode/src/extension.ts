import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand, refreshLinksCommand, openDocsCommand, openPreviewCommand, prefillDocCommand, highlightConnectionCommand, inviteTeamMemberCommand } from './components/commands';
import { registerAuthRoute } from './components/authentication';
import FileCodeLensProvider from './components/codeLensProvider';
import GlobalState from './utils/globalState';
import { createTreeViews } from './treeviews';

export async function activate(context: vscode.ExtensionContext) {
	const globalState = new GlobalState(context.globalState);
	const viewProvider = new ViewProvider(context.extensionUri, globalState);
	const codeLensProvider = new FileCodeLensProvider(globalState);
	const allLanguages = await vscode.languages.getLanguages();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider),
		vscode.languages.registerCodeLensProvider(allLanguages, codeLensProvider),
		linkCodeCommand(viewProvider),
		linkDirCommand(viewProvider),
		refreshLinksCommand(globalState),
		prefillDocCommand(viewProvider),
		openDocsCommand(),
		openPreviewCommand(),
		highlightConnectionCommand(),
		inviteTeamMemberCommand(globalState),
	);

	registerAuthRoute(viewProvider, globalState);
	vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		vscode.commands.executeCommand('mintlify.link-code', { editor, scheme: 'file' });
	});

	vscode.commands.registerCommand('mintlify.remove-member', () => {
		console.log('Deleting member')
	})

	createTreeViews(globalState);
	vscode.commands.executeCommand('mintlify.refresh-links', context);
}
