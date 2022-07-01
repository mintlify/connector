import axios from 'axios';
import vscode, {
	WebviewViewProvider,
	WebviewView,
	Uri,
	Webview } from "vscode";
import { Code } from "../utils/git";
import { API_ENDPOINT } from '../utils/api';
import { openLogin } from './authentication';
import GlobalState from '../utils/globalState';

export type Doc = {
	org: string;
	url: string;
	method: string;
	content?: string;
	lastUpdatedAt?: Date;
	createdAt?: Date;
};

export type Link = {
	doc: Doc;
	codes: Code[];
};

export class ViewProvider implements WebviewViewProvider {
    public static readonly viewType = 'primary';
    private _view?: WebviewView;
	private globalState: GlobalState;

    constructor(
		private readonly _extensionUri: Uri,
		globalState: GlobalState
	) {
		this.globalState = globalState;
	}

	public authenticate(user: any): void {
		this.globalState.setUserId(user.userId);
		this._view?.webview.postMessage({ command: 'auth', args: user });
		vscode.commands.executeCommand('mintlify.refresh-links');
	}

	public prefillDoc(docId: string): void {
		this.show();
		this._view?.webview.postMessage({ command: 'prefill-doc', args: docId });
	}

	public logout(): void {
		this._view?.webview.postMessage({ command: 'logout' });
		this.globalState.clearState();
	}

    public resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
			webviewView.webview.options = {
					// Allow scripts in the webview
					enableScripts: true,
					localResourceRoots: [this._extensionUri]
			};

			webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
			webviewView.webview.onDidReceiveMessage(async message => {
				switch (message.command) {
					case 'sign-up':
						{
							vscode.env.openExternal(vscode.Uri.parse('https://www.mintlify.com/create'));
							break;
						}
					case 'login':
						{
							const { signInWithProtocol, subdomain } = message.args;
							openLogin(signInWithProtocol);
							this.globalState.setSubdomain(subdomain);
							break;
						}
					case 'get-docs':
						{
							const { userId, subdomain } = message;
							axios.get(`${API_ENDPOINT}/docs`, {
								params: {
									userId,
									subdomain
								}
							})
								.then((res) => {
									const { data: { docs } } = res;
									this._view?.webview.postMessage({ command: 'display-docs', docs });
								});
							break;
						}
					case 'link-submit':
						{
							const { userId, docId, code, subdomain, url } = message.args;
							vscode.window.withProgress({
								location: vscode.ProgressLocation.Notification,
								title: 'Connecting documentation with code',
							}, () => new Promise(async (resolve) => {
								try {
									const response = await axios.put(`${API_ENDPOINT}/links`, { docId, code, url }, {
										params: {
											userId,
											subdomain
										}
									});
									await axios.get(`${API_ENDPOINT}/docs`, {
										params: {
											userId,
											subdomain
										}
									})
									.then((res) => {
										const { data: { docs } } = res;
										this._view?.webview.postMessage({ command: 'update-selected-doc', newDocs: docs, newDoc: response.data.doc });
									});
									vscode.window.showInformationMessage(`Successfully connected code with ${response.data.doc.title}`);
								} catch (err) {
									const errMessage = err?.response?.data?.error ?? `Error connecting code. Please log back in, re-install the extension, or report bug to hi@mintlify.com`;
									vscode.window.showInformationMessage(errMessage);
								}
								vscode.commands.executeCommand('mintlify.refresh-links');
								resolve(null);
							}));
							break;
						}
					case 'error':
						{
							const errMessage = message?.message;
							vscode.window.showInformationMessage(errMessage);
						}
				}
			});

			this._view = webviewView;
			this._view?.webview.postMessage({ command: 'start', args: API_ENDPOINT });
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
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}