import * as vscode from 'vscode';
import { Doc, ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand, refreshLinksCommand, openDocsCommand } from './components/commands';
import { registerAuthRoute } from './components/authentication';
import FileCodeLensProvider from './components/codeLensProvider';
import GlobalState from './utils/globalState';
import { DocumentsTreeProvider } from './treeviews/documents';
import { CodeReturned, ConnectionsTreeProvider } from './treeviews/connections';
import { deleteDoc, deleteLink, editDocName } from './utils/links';
import { Code } from './utils/git';
import axios from 'axios';
import { API_ENDPOINT } from './utils/api';

const createTreeViews = (state: GlobalState): void => {
	const documentsTreeProvider = new DocumentsTreeProvider(state);
	const connectionsTreeProvider = new ConnectionsTreeProvider(state);
	vscode.window.createTreeView('documents', { treeDataProvider: documentsTreeProvider });
	vscode.window.createTreeView('connections', { treeDataProvider: connectionsTreeProvider });

	vscode.commands.registerCommand('mintlify.refresh-views', () => {
		documentsTreeProvider.refresh();
		connectionsTreeProvider.refresh();
	});

	vscode.commands.registerCommand('mintlify.delete-connection', async (connection: { code: Code }) => {
		const response = await vscode.window.showInformationMessage(`Are you sure you would like to delete the connection? This cannot be undone`, 'Delete', 'Cancel');
		if (response !== 'Delete') {
			return;
		}
		deleteLink(state, connection.code._id);
		connectionsTreeProvider.refresh();
		vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.commands.registerCommand('mintlify.rename-document', async (docOption) => {
		const newName = await vscode.window.showInputBox({
			title: 'Edit name of document',
			value: docOption.doc.title,
			placeHolder: docOption.doc.title,
		});

		if (!newName) {
			return vscode.window.showErrorMessage('New name cannot be empty');
		}

		await editDocName(state, docOption.doc._id, newName);
		vscode.window.showInformationMessage(`Document has been renamed to ${newName}`);
		vscode.commands.executeCommand('mintlify.refresh-views');
		vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.commands.registerCommand('mintlify.delete-document', async (docOption) => {
		const response = await vscode.window.showInformationMessage(`Are you sure you would like to delete ${docOption.doc.title}? This cannot be undone`, 'Delete', 'Cancel');
		if (response !== 'Delete') {
			return;
		}
		await deleteDoc(state, docOption.doc._id);
		vscode.commands.executeCommand('mintlify.refresh-views');
		vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor == null) {
			return;
		}
		connectionsTreeProvider.refresh();
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

	vscode.commands.registerCommand('mintlify.prefill-doc', async (doc: Doc) => {
		const panel = vscode.window.createWebviewPanel(
			'mintlify.preview',
			doc.title,
			{
				viewColumn: vscode.ViewColumn.Two,
				preserveFocus: true,
			},
			{
				enableScripts: true
			}
		);

		try {
			const url = doc.url;
			const { data: hyperbeamIframeUrl } = await axios.get(`${API_ENDPOINT}/links/iframe`, {
				params: {
					url
				}
			});
			const iframe = `<iframe src="${hyperbeamIframeUrl}" style="position:fixed;border:0;width:100%;height:100%"></iframe>`;
			panel.webview.html = iframe;
		} catch {
			panel.dispose();
			vscode.env.openExternal(vscode.Uri.parse(doc.url));
		}

		viewProvider.prefillDoc(doc);
	});

	vscode.commands.registerCommand('mintlify.highlight-connection', async (code: CodeReturned) => {
		if (code.line != null && code.endLine != null) {
			const rootPath = vscode.workspace.workspaceFolders![0].uri.path;
			const filePathUri  = vscode.Uri.parse(`${rootPath}/${code.file}`);
			const selectedRange = new vscode.Range(code.line, 0, code.endLine, 9999);
			vscode.window.activeTextEditor?.revealRange(selectedRange);
			await vscode.window.showTextDocument(filePathUri, {
				selection: selectedRange,
				preserveFocus: true,
			});
		}
	});
	createTreeViews(globalState);
	vscode.commands.executeCommand('mintlify.refresh-links', context);
}
