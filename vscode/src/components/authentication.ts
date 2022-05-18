import * as vscode from 'vscode';

export const registerAuthRoute = () => {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      if (uri.path === '/auth') {
        try {
					console.log("What's up?");
          const email = 'Hey there';

          vscode.window.showInformationMessage(`🙌 Successfully signed in with ${email}`);
        } catch (err) {
          vscode.window.showErrorMessage('Error authenticating user');
        }
      }
    }
  });
};

export const openGitHubLogin = () => {
  return vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000/api/login/vscode'));
};