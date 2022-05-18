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