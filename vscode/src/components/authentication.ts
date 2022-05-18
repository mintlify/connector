import * as vscode from 'vscode';
import { ViewProvider } from './viewProvider';

export const registerAuthRoute = (provider: ViewProvider) => {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      if (uri.path === '/auth') {
        try {
          const user = {
            userId: '',
            name: '',
            email: 'han@mintlify.com'
          };

          provider.authenticate(user);

          vscode.window.showInformationMessage(`🙌 Successfully signed in with ${user.email}`);
        } catch (err) {
          vscode.window.showErrorMessage('Error authenticating user');
        }
      }
    }
  });

  vscode.commands.registerCommand('mintlify.logout', () => {
    provider.logout();
  });
};

export const openLogin = () => {
  return vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000/api/login/vscode'));
};