import * as vscode from 'vscode';
import GlobalState from '../utils/globalState';
import { ViewProvider } from './viewProvider';

// Register the global when clause for isLoggedIn
const setLoginContext = (globalState: GlobalState): void => {
	// Manage authentication states
	vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', globalState.getUserId() != null);
}

export const registerAuthRoute = (provider: ViewProvider, globalState: GlobalState) => {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      if (uri.path === '/auth') {
        try {
          const query = new URLSearchParams(uri.query);
          const userRaw = query.get('user');
          if (userRaw == null) {
            vscode.window.showErrorMessage('Unable to authenticate. Try again later');
            return;
          }

          const user = JSON.parse(userRaw);
          if (!user.email) {
            vscode.window.showErrorMessage('User has insufficient credentials. Try again later');
            return;
          }
          const subdomain = query.get('subdomain');
          provider.authenticate(user, subdomain);
        } catch (err) {
          vscode.window.showErrorMessage('Error authenticating user');
        }
      } else if (uri.path === '/prefill-doc') {
        const query = new URLSearchParams(uri.query);
        const docId = query.get('docId');
        if (!docId) {
          vscode.window.showErrorMessage('No document identifier selected');
          return;
        }

        provider.prefillDocWithDocId(docId);
      }
    }
  });

  vscode.commands.registerCommand('mintlify.login', () => {
    provider.displaySignin();
  });

  vscode.commands.registerCommand('mintlify.logout', () => {
    provider.logout();
  });

  setLoginContext(globalState);
};

export const openLogin = (endpoint: string) => {
  return vscode.env.openExternal(vscode.Uri.parse(`${endpoint}/api/login/vscode`));
};