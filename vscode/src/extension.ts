import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand } from './components/linkCommands';
import { registerAuthRoute, AuthService } from './components/authentication';

export function activate(context: vscode.ExtensionContext) {
	const authService = new AuthService(context.globalState);
	const provider = new ViewProvider(context.extensionUri, authService);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, provider),
		linkCodeCommand(provider),
		linkDirCommand(provider)
	);
	registerAuthRoute(provider);

	vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		vscode.commands.executeCommand('mintlify.link-code', { editor, scheme: 'file' });
	});
}
