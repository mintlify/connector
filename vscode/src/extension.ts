import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand, refreshLinksCommand, openDocsCommand } from './components/commands';
import { registerAuthRoute } from './components/authentication';
import FileCodeLensProvider from './components/codeLensProvider';
import GlobalState from './utils/globalState';
import { ConnectionsTreeProvider } from './treeviews/connections';
import { doRegisterBuiltinGitProvider } from './utils/git/builtInGit';
import { GitApiImpl } from './utils/git/gitApiImpl';
import { Repository } from './utils/git/types';

const createTreeViews = (state: GlobalState): void => {
	const connectionsTreeProvider = new ConnectionsTreeProvider(state);
	vscode.window.createTreeView('connections', { treeDataProvider: connectionsTreeProvider });

	vscode.commands.registerCommand('mintlify.refresh-docs', () => {
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

	vscode.commands.registerCommand('mintlify.prefill-doc', (doc) => {
		viewProvider.prefillDoc(doc);
	});

	createTreeViews(globalState);
	vscode.commands.executeCommand('mintlify.refresh-links', context);

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
		return;
	}
	const codeLensProvider = new FileCodeLensProvider(globalState, repositories[0], git);
	const allLanguages = await vscode.languages.getLanguages();

	context.subscriptions.push(vscode.languages.registerCodeLensProvider(allLanguages, codeLensProvider));
};
