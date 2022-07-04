import * as vscode from 'vscode';
import { ViewProvider } from './viewProvider';

export const registerAuthRoute = (provider: ViewProvider) => {
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

          provider.authenticate(user);
          vscode.window.showInformationMessage(`🙌 Successfully signed in with ${user.email}`);
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

  vscode.commands.registerCommand('mintlify.logout', () => {
    provider.logout();
  });
};

export const openLogin = (endpoint: string) => {
  return vscode.env.openExternal(vscode.Uri.parse(`${endpoint}/api/login/vscode`));
};