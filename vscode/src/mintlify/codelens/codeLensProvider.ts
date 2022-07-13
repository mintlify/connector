import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	DocumentSelector,
	Event,
	EventEmitter,
	TextDocument,
} from 'vscode';
import { CodeLensScopes, configuration } from '../../configuration';
import { Schemes } from '../../constants';
import { Container } from '../../container';
import { GitBlame } from '../../git/models';

export class DocCodeLensProvider implements CodeLensProvider {
	static selector: DocumentSelector = [
		{ scheme: Schemes.File },
		{ scheme: Schemes.Git },
		{ scheme: Schemes.GitLens },
		{ scheme: Schemes.PRs },
		{ scheme: Schemes.Vsls },
		{ scheme: Schemes.VslsScc },
		{ scheme: Schemes.Virtual },
		{ scheme: Schemes.GitHub },
	];
	private _onDidChangeCodeLenses = new EventEmitter<void>();
	get onDidChangeCodeLenses(): Event<void> {
		return this._onDidChangeCodeLenses.event;
	}

	constructor(private readonly container: Container) {}

	reset(_reason?: 'idle' | 'saved') {
		this._onDidChangeCodeLenses.fire();
	}

	async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
		const trackedDocument = await this.container.tracker.getOrAdd(document);
		if (!trackedDocument.isBlameable) return [];

		let dirty = false;
		if (document.isDirty) {
			// Only allow dirty blames if we are idle
			if (trackedDocument.isDirtyIdle) {
				const maxLines = this.container.config.advanced.blame.sizeThresholdAfterEdit;
				if (maxLines > 0 && document.lineCount > maxLines) {
					dirty = true;
				}
			} else {
				dirty = true;
			}
		}

		const cfg = configuration.get('codeLens', document);

		let languageScope = cfg.scopesByLanguage?.find(ll => ll.language?.toLowerCase() === document.languageId);
		if (languageScope == null) {
			languageScope = {
				language: document.languageId,
			};
		}
		if (languageScope.scopes == null) {
			languageScope.scopes = cfg.scopes;
		}
		if (languageScope.symbolScopes == null) {
			languageScope.symbolScopes = cfg.symbolScopes;
		}

		languageScope.symbolScopes =
			languageScope.symbolScopes != null
				? (languageScope.symbolScopes = languageScope.symbolScopes.map(s => s.toLowerCase()))
				: [];

		const lenses: CodeLens[] = [];

		const gitUri = trackedDocument.uri;
		let blame: GitBlame | undefined;

		if (!dirty) {
			if (token.isCancellationRequested) return lenses;
			blame = await this.container.git.getBlame(gitUri, document);
			if (blame == null || blame?.lines.length === 0) return lenses;
		} else if (languageScope.scopes.length !== 1 || !languageScope.scopes.includes(CodeLensScopes.Document)) {
			const tracked = await this.container.git.isTracked(gitUri);

			if (!tracked) return lenses;
		}

		if (token.isCancellationRequested) return lenses;

		return lenses;
	}
}
