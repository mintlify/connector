import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand, refreshLinksCommand, openDocsCommand } from './components/commands';
import { registerAuthRoute } from './components/authentication';
import FileCodeLensProvider from './components/codeLensProvider';
import GlobalState from './utils/globalState';
import { DocumentsTreeProvider } from './treeviews/documents';
import { ConnectionsTreeProvider } from './treeviews/connections';

const createTreeViews = (state: GlobalState): void => {
	const documentsTreeProvider = new DocumentsTreeProvider(state);
	const connectionsTreeProvider = new ConnectionsTreeProvider(state);
	vscode.window.createTreeView('documents', { treeDataProvider: documentsTreeProvider });
	vscode.window.createTreeView('connections', { treeDataProvider: connectionsTreeProvider });

	vscode.commands.registerCommand('mintlify.refresh-docs', () => {
		documentsTreeProvider.refresh();
	});
};

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
		openDocsCommand()
	);
	registerAuthRoute(viewProvider);

	vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		vscode.commands.executeCommand('mintlify.link-code', { editor, scheme: 'file' });
	});

	vscode.commands.registerCommand('mintlify.prefill-doc', (doc) => {
		viewProvider.prefillDoc(doc);
	});

	createTreeViews(globalState);
	vscode.commands.executeCommand('mintlify.refresh-links', context);
}
