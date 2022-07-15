import {
	CancellationToken,
	Disposable,
	Event,
	EventEmitter,
	FileDecoration,
	FileDecorationProvider,
	ThemeColor,
	Uri,
	window,
} from 'vscode';
import { GlyphChars } from '../constants';

export class ViewFileDecorationProvider implements FileDecorationProvider, Disposable {
	private readonly _onDidChange = new EventEmitter<undefined | Uri | Uri[]>();
	get onDidChange(): Event<undefined | Uri | Uri[]> {
		return this._onDidChange.event;
	}

	private readonly disposable: Disposable;
	constructor() {
		this.disposable = Disposable.from(
			// Register the current branch decorator separately (since we can only have 2 char's per decoration)
			window.registerFileDecorationProvider({
				provideFileDecoration: (uri, token) => {
					if (uri.scheme !== 'gitlens-view') return undefined;

					if (uri.authority === 'branch') {
						return this.provideBranchCurrentDecoration(uri, token);
					}

					if (uri.authority === 'remote') {
						return this.provideRemoteDefaultDecoration(uri, token);
					}

					return undefined;
				},
			}),
			window.registerFileDecorationProvider(this),
		);
	}

	dispose(): void {
		this.disposable.dispose();
	}

	provideFileDecoration(uri: Uri, token: CancellationToken): FileDecoration | undefined {
		if (uri.scheme !== 'gitlens-view') return undefined;

		switch (uri.authority) {
			case 'branch':
				return this.provideBranchStatusDecoration(uri, token);
			case 'commit-file':
				return this.provideCommitFileStatusDecoration(uri, token);
		}

		return undefined;
	}

	provideCommitFileStatusDecoration(uri: Uri, _token: CancellationToken): FileDecoration | undefined {
		return;
	}

	provideBranchStatusDecoration(uri: Uri, _token: CancellationToken): FileDecoration | undefined {
		return;
	}

	provideBranchCurrentDecoration(uri: Uri, _token: CancellationToken): FileDecoration | undefined {
		return;
	}

	provideRemoteDefaultDecoration(uri: Uri, _token: CancellationToken): FileDecoration | undefined {
		const [, isDefault] = uri.path.split('/');

		if (!isDefault) return undefined;

		return {
			badge: GlyphChars.Check,
			tooltip: 'Default Remote',
		};
	}
}
