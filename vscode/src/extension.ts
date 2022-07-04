import * as vscode from 'vscode';
import { ViewProvider } from './components/viewProvider';
import { linkCodeCommand, linkDirCommand, refreshLinksCommand, openDocsCommand } from './components/commands';
import { registerAuthRoute } from './components/authentication';
import FileCodeLensProvider from './components/codeLensProvider';
import GlobalState from './utils/globalState';
import { ConnectionsTreeProvider } from './treeviews/connections';
import { doRegisterBuiltinGitProvider } from './utils/builtInGit';
import { GitApiImpl } from './utils/gitApiImpl';

const createTreeViews = (state: GlobalState): void => {
	const connectionsTreeProvider = new ConnectionsTreeProvider(state);
	vscode.window.createTreeView('connections', { treeDataProvider: connectionsTreeProvider });

	vscode.commands.registerCommand('mintlify.refresh-docs', () => {
		connectionsTreeProvider.refresh();
	});
};

export async function activate(context: vscode.ExtensionContext): Promise<GitApiImpl> {
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

	const apiImpl = new GitApiImpl();
	await deferredActivate(context, apiImpl);
	console.log({apiImpl});
	return apiImpl;
}

const deferredActivate = async (context: vscode.ExtensionContext, apiImpl: GitApiImpl) => {
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
	console.log({repositories});

	// await init(context, apiImpl, credentialStore, repositories, prTree, liveshareApiPromise, showPRController);

};
