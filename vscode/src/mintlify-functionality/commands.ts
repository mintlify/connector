import axios from 'axios';
import * as vscode from 'vscode';
import { CodeReturned } from './treeviews/connections';
import { API_ENDPOINT } from './utils/api';
import { GlobalState } from './utils/globalState';

// TODO - update this to correspond with git line changes
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
