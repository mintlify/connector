import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand } from './components/linkCommands';
import { registerAuthRoute } from './components/authentication';
import { getHighlightedText } from './utils';
import { getGitData } from './utils/git';

export function activate(context: vscode.ExtensionContext) {
	const provider = new ViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, provider),
		linkCodeCommand(provider),
		linkDirCommand(provider)
	);
	registerAuthRoute(provider);

	vscode.window.onDidChangeTextEditorSelection((event) => {
		const editor = event.textEditor;
		if (editor) {
			const fileFsPath: string = editor.document.uri.fsPath;
			const { selection, highlighted } = getHighlightedText(editor);
			if (highlighted) {
					const selectedLines: number[] = [selection.start.line, selection.end.line];
					getGitData(fileFsPath, provider, 'lines', selectedLines);
			} else {
					getGitData(fileFsPath, provider, 'file');
			}
	}
	});
}
