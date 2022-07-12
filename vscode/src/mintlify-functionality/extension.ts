import * as vscode from 'vscode';
import { registerAuthRoute } from './authentication';
import { DocCodeLensProvider } from './codeLensProvider';
import {
	highlightConnectionCommand,
	inviteTeamMemberCommand,
	linkCodeCommand,
	linkDirCommand,
	openDocsCommand,
	openPreviewCommand,
	prefillDocCommand,
	refreshLinksCommand,
	removeTeamMemberCommand,
} from './commands';
import { createTreeViews } from './treeviews';
import { doRegisterBuiltinGitProvider } from './utils/git/builtInGit';
import { GitApiImpl } from './utils/git/gitApiImpl';
import { Repository } from './utils/git/types';
import { GlobalState } from './utils/globalState';
import { ViewProvider } from './viewProvider';

export async function mintlifyActivate(context: vscode.ExtensionContext): Promise<GitApiImpl> {
	const openDiff = vscode.workspace.getConfiguration('git').get('openDiffOnClick', true);
	await vscode.commands.executeCommand('setContext', 'openDiffOnClick', openDiff);

	const globalState = new GlobalState(context.globalState);
	const viewProvider = new ViewProvider(context.extensionUri, globalState);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider),
		linkCodeCommand(viewProvider),
		linkDirCommand(viewProvider),
		refreshLinksCommand(globalState),
		prefillDocCommand(viewProvider),
		openDocsCommand(),
		openPreviewCommand(globalState),
		highlightConnectionCommand(),
		inviteTeamMemberCommand(globalState),
		removeTeamMemberCommand(globalState),
	);

	await registerAuthRoute(viewProvider, globalState);

	vscode.window.onDidChangeTextEditorSelection(async event => {
		const editor = event.textEditor;
		await vscode.commands.executeCommand('mintlify.link-code', { editor: editor, scheme: 'file' });
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

const init = async (
	context: vscode.ExtensionContext,
	git: GitApiImpl,
	globalState: GlobalState,
	repositories: Repository[],
) => {
	// Sort the repositories to match folders in a multiroot workspace (if possible).
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders != null) {
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

	context.subscriptions.push(
		git.onDidChangeState(async e => {
			if (e === 'initialized') {
				await updateRepoInfo();
			}
		}),
	);

	context.subscriptions.push(
		git.onDidCloseRepository(async () => {
			await updateRepoInfo();
		}),
	);

	context.subscriptions.push(
		git.onDidOpenRepository(async () => {
			await updateRepoInfo();
		}),
	);

	vscode.workspace.onDidSaveTextDocument(async () => {
		await vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.workspace.onDidOpenTextDocument(async () => {
		await vscode.commands.executeCommand('mintlify.refresh-links');
	});

	await vscode.commands.executeCommand('mintlify.refresh-links', context);
};
