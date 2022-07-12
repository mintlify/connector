import axios from 'axios';
import vscode, { Uri, Webview, WebviewView, WebviewViewProvider } from 'vscode';
import { openLogin } from './authentication';
import { API_ENDPOINT } from './utils/api';
import { Code } from './utils/git';
import { GlobalState } from './utils/globalState';

export type Doc = {
	org: string;
	url: string;
	method: string;
	content?: string;
	lastUpdatedAt?: Date;
	createdAt?: Date;
	title: string;
};

export type Link = {
	doc: Doc;
	codes: Code[];
};

export class ViewProvider implements WebviewViewProvider {
	public static readonly viewType = 'create';
	private _view?: WebviewView;
	private globalState: GlobalState;

	constructor(private readonly _extensionUri: Uri, globalState: GlobalState) {
		this.globalState = globalState;
	}

	public async authenticate(user: any) {
		await this.globalState.setUserId(user.userId);
		await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', true);
		await vscode.window.showInformationMessage(`🙌 Successfully signed in with ${user.email}`);
		await vscode.commands.executeCommand('mintlify.refresh-links');
		await vscode.commands.executeCommand('mintlify.refresh-views');
		await this._view?.webview.postMessage({ command: 'auth', args: user });
	}

	public prefillDocWithDocId = (docId: string) => {
		this.show();
		// TBD: Add doc data
	};

	public async prefillDoc(doc: Doc) {
		this.show();
		await this._view?.webview.postMessage({ command: 'prefill-doc', args: doc });
	}

	public async displaySignin() {
		await this._view?.webview.postMessage({ command: 'display-signin' });
	}

	public async logout() {
		await this._view?.webview.postMessage({ command: 'logout' });
		await this.globalState.clearState();
		await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', false);
		await vscode.commands.executeCommand('mintlify.refresh-views');
		await vscode.commands.executeCommand('mintlify.refresh-links');
		await vscode.window.showInformationMessage('Successfully logged out of account');
	}

	public async resolveWebviewView(webviewView: WebviewView) {
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		webviewView.webview.onDidReceiveMessage(async message => {
			switch (message.command) {
				case 'login-oauth': {
					const { provider } = message.args;
					const anonymousId = vscode.env.machineId;
					await vscode.env.openExternal(
						vscode.Uri.parse(`${API_ENDPOINT}/user/anonymous/${provider}?anonymousId=${anonymousId}`),
					);
					break;
				}
				case 'login': {
					const { signInWithProtocol, subdomain } = message.args;
					await openLogin(signInWithProtocol);
					await this.globalState.setSubdomain(subdomain);
					break;
				}
				case 'link-submit': {
					const { docId, code, url } = message.args;
					await vscode.window.withProgress(
						{
							location: vscode.ProgressLocation.Notification,
							title: 'Connecting documentation with code',
						},
						async () => {
							try {
								const response = await axios.put(
									`${API_ENDPOINT}/links`,
									{ docId: docId, code: code, url: url },
									{
										params: this.globalState.getAuthParams(),
									},
								);
								await this.prefillDoc(response.data.doc);
								await vscode.commands.executeCommand('mintlify.refresh-views');
								await vscode.window.showInformationMessage(
									`Successfully connected code with ${response.data.doc.title}`,
								);
							} catch (err) {
								const errMessage =
									err?.response?.data?.error ??
									`Error connecting code. Please log back in, re-install the extension, or report bug to hi@mintlify.com`;
								await vscode.window.showInformationMessage(errMessage);
							}
							await vscode.commands.executeCommand('mintlify.refresh-links');
						},
					);
					break;
				}
				case 'refresh-code': {
					const editor = vscode.window.activeTextEditor;
					await vscode.commands.executeCommand('mintlify.link-code', { editor: editor, scheme: 'file' });
					break;
				}
				case 'error': {
					const errMessage = message?.message;
					await vscode.window.showInformationMessage(errMessage);
				}
			}
		});

		this._view = webviewView;
		await this._view?.webview.postMessage({ command: 'start', args: API_ENDPOINT });
	}

	public show() {
		this._view?.show();
	}

	public postCode(code: Code) {
		return this._view?.webview.postMessage({ command: 'post-code', args: code });
	}

	private _getHtmlForWebview(webview: Webview) {
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		const uri = Uri.joinPath(this._extensionUri, 'dist', 'webviewActivityBar.js');

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>Mintlify</title>
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src https://connect.mintlify.com http://localhost:5000; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
			</head>

			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>

				<script nonce="${nonce}" src="${webview.asWebviewUri(uri).toString()}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
