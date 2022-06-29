import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand } from './components/linkCommands';
import { registerAuthRoute, AuthService } from './components/authentication';
import FileCodeLensProvider from './components/codeLensProvider';

export async function activate(context: vscode.ExtensionContext) {
	const authService = new AuthService(context.globalState);
	const viewProvider = new ViewProvider(context.extensionUri, authService);
	const codeLensProvider = new FileCodeLensProvider(authService);
	const allLanguages = await vscode.languages.getLanguages();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider),
		vscode.languages.registerCodeLensProvider(allLanguages, codeLensProvider),
		linkCodeCommand(viewProvider),
		linkDirCommand(viewProvider)
	);
	registerAuthRoute(viewProvider);

	vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		vscode.commands.executeCommand('mintlify.link-code', { editor, scheme: 'file' });
	});
}
