import * as vscode from 'vscode';
import { GlobalState } from './utils/globalState';
import { ViewProvider } from './viewProvider';

// Register the global when clause for isLoggedIn
const setLoginContext = async (globalState: GlobalState) => {
	// Manage authentication states
	await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', globalState.getUserId() != null);
};

export const registerAuthRoute = async (provider: ViewProvider, globalState: GlobalState) => {
	vscode.window.registerUriHandler({
		handleUri: async function (uri: vscode.Uri) {
			if (uri.path === '/auth') {
				try {
					const query = new URLSearchParams(uri.query);
					const userRaw = query.get('user');
					if (userRaw == null) {
						await vscode.window.showErrorMessage('Unable to authenticate. Try again later');
						return;
					}

					const user = JSON.parse(userRaw);
					if (user?.email == null) {
						await vscode.window.showErrorMessage('User has insufficient credentials. Try again later');
						return;
					}

					provider.authenticate(user);
				} catch (err) {
					await vscode.window.showErrorMessage('Error authenticating user');
				}
			} else if (uri.path === '/prefill-doc') {
				const query = new URLSearchParams(uri.query);
				const docId = query.get('docId');
				if (!docId) {
					await vscode.window.showErrorMessage('No document identifier selected');
					return;
				}

				provider.prefillDocWithDocId(docId);
			}
		},
	});

	vscode.commands.registerCommand('mintlify.login', () => {
		provider.displaySignin();
	});

	vscode.commands.registerCommand('mintlify.logout', () => {
		provider.logout();
	});

	await setLoginContext(globalState);
};

export const openLogin = (endpoint: string) => {
	return vscode.env.openExternal(vscode.Uri.parse(`${endpoint}/api/login/vscode`));
};
