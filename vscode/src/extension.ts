import * as vscode from 'vscode';
import { Doc, ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand, refreshLinksCommand, openDocsCommand } from './components/commands';
import { registerAuthRoute } from './mintlify-functionality/authentication';
import DocCodeLensProvider from './components/codeLensProvider';
import GlobalState from './utils/globalState';
import { doRegisterBuiltinGitProvider } from './utils/git/builtInGit';
import { GitApiImpl } from './utils/git/gitApiImpl';
import { Repository } from './utils/git/types';
import { DocumentsTreeProvider } from './treeviews/documents';
import { CodeReturned, ConnectionsTreeProvider } from './treeviews/connections';
import { deleteDoc, deleteLink, editDocName } from './utils/links';
import { Code } from './utils/git';

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

export async function activate(context: vscode.ExtensionContext): Promise<GitApiImpl> {
	const openDiff = vscode.workspace.getConfiguration('git').get('openDiffOnClick', true);
	await vscode.commands.executeCommand('setContext', 'openDiffOnClick', openDiff);

	const globalState = new GlobalState(context.globalState);
	const viewProvider = new ViewProvider(context.extensionUri, globalState);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider),
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

	vscode.commands.registerCommand('mintlify.prefill-doc', (doc: Doc) => {
		viewProvider.prefillDoc(doc);
	});

	vscode.commands.registerCommand('mintlify.highlight-connection', async (code: CodeReturned) => {
		if (code.line != null && code.endLine != null) {
			const rootPath = vscode.workspace.workspaceFolders![0].uri.path;
			const filePathUri = vscode.Uri.parse(`${rootPath}/${code.file}`);
			const selectedRange = new vscode.Range(code.line, 0, code.endLine, 9999);
			vscode.window.activeTextEditor?.revealRange(selectedRange);
			await vscode.window.showTextDocument(filePathUri, {
				selection: selectedRange,
				preserveFocus: true,
			});
		}
	});
	createTreeViews(globalState);

	const apiImpl = new GitApiImpl();
	await deferredActivate(context, globalState, apiImpl);
	return apiImpl;
}

const deferredActivate = async (context: vscode.ExtensionContext, globalState: GlobalState, apiImpl: GitApiImpl) => {
	if (!(await doRegisterBuiltinGitProvider(context, apiImpl))) {
		const extensionsChangedDisposable = vscode.extensions.onDidChange(async () => {
			if (await doRegisterBuiltinGitProvider(context, apiImpl)) {
				extensionsChangedDisposable.dispose();
			}
		});
		context.subscriptions.push(extensionsChangedDisposable);
	}
	context.subscriptions.push(apiImpl);

	const repositories = apiImpl.repositories;

	await init(context, apiImpl, globalState, repositories);
};

const init = async (context: vscode.ExtensionContext, git: GitApiImpl, globalState: GlobalState, repositories: Repository[]) => {
	// Sort the repositories to match folders in a multiroot workspace (if possible).
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders) {
		repositories = repositories.sort((a, b) => {
			let indexA = workspaceFolders.length;
			let indexB = workspaceFolders.length;
			for (let i = 0; i < workspaceFolders.length; i++) {
				if (workspaceFolders[i].uri.toString() === a.rootUri.toString()) {
					indexA = i;
				} else if (workspaceFolders[i].uri.toString() === b.rootUri.toString()) {
					indexB = i;
				}
				if (indexA !== workspaceFolders.length && indexB !== workspaceFolders.length) {
					break;
				}
			}
			return indexA - indexB;
		});
	}

	if (repositories.length === 0) {
		// Repos is empty
	}
	const codeLensProvider = new DocCodeLensProvider(globalState, repositories, git);
	const allLanguages = await vscode.languages.getLanguages();

	context.subscriptions.push(vscode.languages.registerCodeLensProvider(allLanguages, codeLensProvider));

	const updateRepoInfo = async () => {
		console.log('Updating repo info');
		const repos = git.repositories;
		codeLensProvider.repositories = repos;
		await codeLensProvider.refreshCodeLenses();
	};

	context.subscriptions.push(git.onDidChangeState(async (e) => {
		if (e === 'initialized') {
			await updateRepoInfo();
		}
	}));

	context.subscriptions.push(git.onDidCloseRepository(async (e) => {
		await updateRepoInfo();
	}));

	context.subscriptions.push(git.onDidOpenRepository(async (e) => {
		await updateRepoInfo();
	}));

	vscode.workspace.onDidSaveTextDocument(async (e) => {
		await vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.workspace.onDidOpenTextDocument(async (e) => {
		await vscode.commands.executeCommand('mintlify.refresh-links');
	});

	await vscode.commands.executeCommand('mintlify.refresh-links', context);
};
