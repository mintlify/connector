import axios from 'axios';
import {
	CancellationToken,
	Disposable,
	EventEmitter,
	Uri,
	UriHandler,
	Webview,
	WebviewView,
	WebviewViewProvider,
	WebviewViewResolveContext,
	window,
} from 'vscode';
import * as vscode from 'vscode';
import { getNonce } from '@env/crypto';
import { Commands } from '../../constants';
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
// TODO - create webviewbase, message handler, and view commands, onReady
export class ViewProvider implements WebviewViewProvider {
	public static readonly viewType = 'create';
	private _view?: WebviewView;
	protected readonly disposables: Disposable[] = [];
	protected isReady: boolean = false;
	private _disposableView: Disposable | undefined;
	private _uriHandler = new UriEventHandler(this);

	constructor(private readonly container: Container) {
		this.disposables.push(
			window.registerWebviewViewProvider(ViewProvider.viewType, this),
			window.registerUriHandler(this._uriHandler),
			vscode.commands.registerCommand('mintlify.login', async () => {
				await this.displaySignin();
			}),
			vscode.commands.registerCommand('mintlify.logout', async () => {
				await this.logout();
			}),
		);
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

	public async authenticate(user: any, subdomain?: string | null) {
		await this.container.storage.storeSecret('userId', user.userId);
		if (subdomain) {
			await this.container.storage.storeSecret('subdomain', subdomain);
		}
		await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', true);
		await executeCommand(Commands.RefreshLinks);
		await executeCommand(Commands.RefreshViews);
		await this._view?.webview.postMessage({ command: 'auth', args: user });
		await vscode.window.showInformationMessage(`🙌 Successfully signed in with ${user.email}`);
	}

	private async deleteAuthSecrets() {
		await this.container.storage.deleteSecret('userId');
		await this.container.storage.deleteSecret('subdomain');
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
		await executeCommand(Commands.RefreshLinks);
		await executeCommand(Commands.RefreshViews);
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
					try {
						const progress: string = await vscode.window.withProgress(
							{
								location: vscode.ProgressLocation.Notification,
								title: 'Connecting documentation with code',
							},
							() => {
								return new Promise((resolve, reject) => {
									this.container.storage
										.getAuthParams()
										.then(authParams =>
											axios.put(
												`${API_ENDPOINT}/links`,
												{ docId: docId, code: code, url: url },
												{
													params: authParams,
												},
											),
										)
										.then(response => {
											return this.prefillDoc(response.data.doc)
												.then(() => executeCommand(Commands.RefreshLinks))
												.then(() => executeCommand(Commands.RefreshViews))
												.then(() => resolve(response.data.doc.title));
										})
										.catch(err => {
											const errMessage =
												err?.response?.data?.error ??
												`Error connecting code. Please log back in, re-install the extension, or report bug to hi@mintlify.com`;
											return reject(errMessage);
										});
								});
							},
						);
						await vscode.window.showInformationMessage(`Successfully connected code with ${progress}`);
					} catch (errMessage) {
						await vscode.window.showInformationMessage(errMessage);
					}

					break;
				}
				case 'refresh-code': {
					await executeCommand(Commands.LinkCode);
					break;
				}
				case 'error': {
					const errMessage = message?.message;
					await vscode.window.showInformationMessage(errMessage);
				}
			}
		});

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this.container.context.extensionUri],
		};

		this._view = webviewView;

		this._disposableView = Disposable.from(
			this._view.onDidDispose(this.onViewDisposed, this),
			this._view.onDidChangeVisibility(this.onViewVisibilityChanged, this),
		);

		this.refresh();

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

class UriEventHandler extends EventEmitter<Uri> implements UriHandler {
	constructor(private viewProvider: ViewProvider) {
		super();
	}
	public async handleUri(uri: vscode.Uri) {
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
				const subdomain = query.get('subdomain');
				await this.viewProvider.authenticate(user, subdomain);
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

			await this.viewProvider.prefillDocWithDocId(docId);
		}
	}
}
