import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand } from './components/linkCommands';
import { registerAuthRoute } from './components/authentication';

export function activate(context: vscode.ExtensionContext) {
	const provider = new ViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, provider),
		linkCodeCommand(provider),
		linkDirCommand(provider)
	);
	registerAuthRoute(provider);
}
