import axios from 'axios';
import {
	CancellationToken,
	Disposable,
	Uri,
	Webview,
	WebviewView,
	WebviewViewProvider,
	WebviewViewResolveContext,
	window,
} from 'vscode';
import * as vscode from 'vscode';
import { getNonce } from '@env/crypto';
import { Container } from '../../container';
import { Logger } from '../../logger';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { Code } from '../../mintlify-functionality/utils/git';
import { executeCommand } from '../../system/command';
import { log } from '../../system/decorators/log';

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
// TODO - create webviewbase, message handler
export class ViewProvider implements WebviewViewProvider {
	public static readonly viewType = 'create';
	private _view?: WebviewView;
	protected readonly disposables: Disposable[] = [];
	protected isReady: boolean = false;
	private _disposableView: Disposable | undefined;

	constructor(private readonly container: Container) {
		this.disposables.push(window.registerWebviewViewProvider(ViewProvider.viewType, this));
	}

	dispose() {
		this.disposables.forEach(d => d.dispose());
		this._disposableView?.dispose();
	}

	get visible() {
		return this._view?.visible ?? false;
	}

	@log()
	async show(options?: { preserveFocus?: boolean }) {
		const cc = Logger.getCorrelationContext();

		try {
			void (await executeCommand(`${ViewProvider.viewType}.focus`, options));
		} catch (ex) {
			Logger.error(ex, cc);
		}
	}

	protected refresh() {
		if (this._view == null) return;

		this._view.webview.html = this._getHtmlForWebview(this._view.webview);
	}

	private onViewDisposed() {
		this._disposableView?.dispose();
		this._disposableView = undefined;
		this._view = undefined;
	}

	private onViewVisibilityChanged() {
		const visible = this.visible;
		Logger.debug(`WebviewView(${ViewProvider.viewType}).onViewVisibilityChanged`, `visible=${visible}`);

		if (visible) {
			this.refresh();
		}
	}

	private async deleteAuthSecrets() {
		await this.container.storage.deleteSecret('userId');
		await this.container.storage.deleteSecret('subdomain');
	}

	public async authenticate(user: any) {
		await this.container.storage.storeSecret('userId', user.userId);
		await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', true);
		await vscode.window.showInformationMessage(`🙌 Successfully signed in with ${user.email}`);
		await vscode.commands.executeCommand('mintlify.refresh-links');
		await vscode.commands.executeCommand('mintlify.refresh-views');
		await this._view?.webview.postMessage({ command: 'auth', args: user });
	}

	public prefillDocWithDocId = async (docId: string) => {
		await this.show();
		// TBD: Add doc data
	};

	public async prefillDoc(doc: Doc) {
		await this.show();
		await this._view?.webview.postMessage({ command: 'prefill-doc', args: doc });
	}

	public async displaySignin() {
		await this._view?.webview.postMessage({ command: 'display-signin' });
	}

	public async logout() {
		await this._view?.webview.postMessage({ command: 'logout' });
		await this.deleteAuthSecrets();
		await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', false);
		await vscode.commands.executeCommand('mintlify.refresh-views');
		await vscode.commands.executeCommand('mintlify.refresh-links');
		await vscode.window.showInformationMessage('Successfully logged out of account');
	}

	public postCode(code: Code) {
		return this._view?.webview.postMessage({ command: 'post-code', args: code });
	}

	public async resolveWebviewView(
		webviewView: WebviewView,
		_context: WebviewViewResolveContext<unknown>,
		_token: CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this.container.context.extensionUri],
		};

		this._disposableView = Disposable.from(
			this._view.onDidDispose(this.onViewDisposed, this),
			this._view.onDidChangeVisibility(this.onViewVisibilityChanged, this),
		);

		this.refresh();

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
					await this.container.storage.storeSecret('subdomain', subdomain);
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
								const authParams = await this.container.storage.getAuthParams();
								const response = await axios.put(
									`${API_ENDPOINT}/links`,
									{ docId: docId, code: code, url: url },
									{
										params: authParams,
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

		await this._view?.webview.postMessage({ command: 'start', args: API_ENDPOINT });
	}

	private _getHtmlForWebview(webview: Webview) {
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		const uri = Uri.joinPath(this.container.context.extensionUri, 'dist', 'webviewActivityBar.js');

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

export const openLogin = (endpoint: string) => {
	return vscode.env.openExternal(vscode.Uri.parse(`${endpoint}/api/login/vscode`));
};
