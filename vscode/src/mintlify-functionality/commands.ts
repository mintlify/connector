import axios from 'axios';
import * as vscode from 'vscode';
import { CodeReturned } from './treeviews/connections';
import { getHighlightedText } from './utils';
import { API_ENDPOINT } from './utils/api';
import { getGitData, getRepoInfo } from './utils/git';
import { GlobalState } from './utils/globalState';
import { getLinks } from './utils/links';
import { Doc, ViewProvider } from './viewProvider';

export const linkCodeCommand = (provider: ViewProvider) => {
	return vscode.commands.registerCommand('mintlify.link-code', async args => {
		const editor = args?.editor ?? vscode.window.activeTextEditor;

		const { scheme } = args;
		if (scheme !== 'file') {
			return;
		}

		if (editor == null) {
			const fileFsPath: string = editor.document.uri.fsPath;
			const { selection, highlighted } = getHighlightedText(editor);
			if (highlighted) {
				const selectedLines: number[] = [selection.start.line, selection.end.line];
				await getGitData(fileFsPath, provider, 'lines', 'code', selectedLines);
			} else {
				await getGitData(fileFsPath, provider, 'file', 'code');
			}
		}
	});
};

const getIsFolder = (fileStat: vscode.FileStat): boolean => fileStat.type === 2;
const getIsFile = (fileStat: vscode.FileStat): boolean => fileStat.type === 1;

export const linkDirCommand = (provider: ViewProvider) => {
	return vscode.commands.registerCommand('mintlify.link-dir', async args => {
		const { path, scheme } = args;
		if (scheme !== 'file') {
			return;
		}
		const uri: vscode.Uri = vscode.Uri.file(path);

		// most likely evoked from sidebar
		// figure out if it's a folder or file, get git info (git blame)
		const fileStat: vscode.FileStat = await vscode.workspace.fs.stat(uri);
		const isFolder = getIsFolder(fileStat);
		if (isFolder) {
			// git stuff for folder
			const fileFsPath: string = uri.fsPath;
			await getGitData(fileFsPath, provider, 'folder', 'dir');
		}
		const isFile = getIsFile(fileStat);
		if (isFile) {
			// git stuff for file
			const fileFsPath: string = uri.fsPath;
			await getGitData(fileFsPath, provider, 'file', 'dir');
		}
	});
};

export const refreshLinksCommand = (globalState: GlobalState) => {
	return vscode.commands.registerCommand('mintlify.refresh-links', async args => {
		const window = vscode.window;
		const editor = args?.editor ?? window.activeTextEditor;
		const fileFsPath: string = editor.document.uri.fsPath;
		const { gitOrg, repo } = await getRepoInfo(fileFsPath);
		await globalState.setGitOrg(gitOrg);
		await globalState.setRepo(repo);
		const links = await getLinks(globalState);
		await globalState.setLinks(links);
	});
};

export const openDocsCommand = () => {
	return vscode.commands.registerCommand('mintlify.open-doc', async url => {
		await vscode.env.openExternal(vscode.Uri.parse(url));
	});
};

export const openPreviewCommand = (globalState: GlobalState) => {
	return vscode.commands.registerCommand('mintlify.preview-doc', async (doc: Doc) => {
		const panel = vscode.window.createWebviewPanel(
			'mintlify.preview',
			doc.title,
			{
				viewColumn: vscode.ViewColumn.Two,
				preserveFocus: true,
			},
			{
				enableScripts: true,
			},
		);

		try {
			const url = doc.url;
			const { data: hyperbeamIframeUrl } = await axios.get(`${API_ENDPOINT}/links/iframe`, {
				params: {
					...globalState.getAuthParams(),
					url: url,
				},
			});
			const iframe = `<iframe src="${hyperbeamIframeUrl}" style="position:fixed;border:0;width:100%;height:100%"></iframe>`;
			panel.webview.html = iframe;
		} catch {
			panel.dispose();
			await vscode.env.openExternal(vscode.Uri.parse(doc.url));
		}
	});
};

export const prefillDocCommand = (viewProvider: ViewProvider) => {
	return vscode.commands.registerCommand('mintlify.prefill-doc', async (doc: Doc) => {
		await vscode.commands.executeCommand('mintlify.preview-doc', doc);
		await viewProvider.prefillDoc(doc);
	});
};

export const highlightConnectionCommand = () => {
	return vscode.commands.registerCommand('mintlify.highlight-connection', async (code: CodeReturned) => {
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
};

export const inviteTeamMemberCommand = (globalState: GlobalState) => {
	return vscode.commands.registerCommand('mintlify.invite-member', async () => {
		const memberEmail = await vscode.window.showInputBox({
			title: 'Invite member by email',
			placeHolder: 'hi@example.com',
			validateInput: (email: string) => {
				const isValidEmail = email
					.toLowerCase()
					.match(
						/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					);

				if (isValidEmail != null) {
					return null;
				}

				return 'Invalid email address';
			},
		});

		if (!memberEmail) {
			return;
		}

		try {
			await axios.post(
				`${API_ENDPOINT}/user/invite`,
				{
					emails: [memberEmail],
					isVSCode: true,
				},
				{
					params: globalState.getAuthParams(),
				},
			);
			await vscode.window.showInformationMessage(`Invited ${memberEmail} to your team`);
			await vscode.commands.executeCommand('mintlify.refresh-views');
		} catch (error) {
			await vscode.window.showInformationMessage('Error occurred while inviting member');
		}
	});
};

export const removeTeamMemberCommand = (globalState: GlobalState) => {
	return vscode.commands.registerCommand('mintlify.remove-member', async member => {
		const email = member.email;
		const response = await vscode.window.showInformationMessage(
			`Are you sure you would like to remove ${email}?`,
			'Remove',
			'Cancel',
		);
		if (response === 'Remove') {
			try {
				await axios.delete(`${API_ENDPOINT}/org/member/${email}`, {
					params: globalState.getAuthParams(),
				});
				await vscode.window.showInformationMessage(`Removed ${email} from organization`);
				await vscode.commands.executeCommand('mintlify.refresh-views');
			} catch {
				await vscode.window.showErrorMessage('Error occurred while removing team member');
			}
		}
	});
};
