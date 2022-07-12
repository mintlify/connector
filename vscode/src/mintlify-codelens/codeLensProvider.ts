import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	Command,
	DocumentSelector,
	DocumentSymbol,
	Event,
	EventEmitter,
	Location,
	Position,
	Range,
	SymbolInformation,
	SymbolKind,
	TextDocument,
	Uri,
} from 'vscode';
import {
	CodeLensCommand,
	CodeLensConfig,
	CodeLensLanguageScope,
	CodeLensScopes,
	configuration,
} from '../configuration';
import { CoreCommands, Schemes } from '../constants';
import { Container } from '../container';
import type { GitUri } from '../git/gitUri';
import { GitBlame, GitBlameLines } from '../git/models';
import { Logger } from '../logger';
import { executeCoreCommand } from '../system/command';
import { is, once } from '../system/function';

export class GitRecentChangeCodeLens extends CodeLens {
	constructor(
		public readonly languageId: string,
		public readonly symbol: DocumentSymbol | SymbolInformation,
		public readonly uri: GitUri | undefined,
		public readonly dateFormat: string | null,
		private readonly blame: (() => GitBlameLines | undefined) | undefined,
		public readonly blameRange: Range,
		public readonly isFullRange: boolean,
		range: Range,
		public readonly desiredCommand: CodeLensCommand | false,
		command?: Command | undefined,
	) {
		super(range, command);
	}

	getBlame(): GitBlameLines | undefined {
		return this.blame?.();
	}
}

export class GitAuthorsCodeLens extends CodeLens {
	constructor(
		public readonly languageId: string,
		public readonly symbol: DocumentSymbol | SymbolInformation,
		public readonly uri: GitUri | undefined,
		private readonly blame: () => GitBlameLines | undefined,
		public readonly blameRange: Range,
		public readonly isFullRange: boolean,
		range: Range,
		public readonly desiredCommand: CodeLensCommand | false,
	) {
		super(range);
	}

	getBlame(): GitBlameLines | undefined {
		return this.blame();
	}
}

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
		let symbols;

		if (!dirty) {
			if (token.isCancellationRequested) return lenses;

			if (languageScope.scopes.length === 1 && languageScope.scopes.includes(CodeLensScopes.Document)) {
				blame = await this.container.git.getBlame(gitUri, document);
			} else {
				[blame, symbols] = await Promise.all([
					this.container.git.getBlame(gitUri, document),
					executeCoreCommand<[Uri], SymbolInformation[]>(
						CoreCommands.ExecuteDocumentSymbolProvider,
						document.uri,
					),
				]);
			}

			if (blame == null || blame?.lines.length === 0) return lenses;
		} else if (languageScope.scopes.length !== 1 || !languageScope.scopes.includes(CodeLensScopes.Document)) {
			let tracked;
			[tracked, symbols] = await Promise.all([
				this.container.git.isTracked(gitUri),
				executeCoreCommand<[Uri], SymbolInformation[]>(
					CoreCommands.ExecuteDocumentSymbolProvider,
					document.uri,
				),
			]);

			if (!tracked) return lenses;
		}

		if (token.isCancellationRequested) return lenses;

		const documentRangeFn = once(() => document.validateRange(new Range(0, 0, 1000000, 1000000)));

		// Since blame information isn't valid when there are unsaved changes -- update the lenses appropriately
		const dirtyCommand: Command | undefined = dirty
			? { command: undefined!, title: this.getDirtyTitle(cfg) }
			: undefined;

		if (symbols !== undefined) {
			Logger.log('GitCodeLensProvider.provideCodeLenses:', `${symbols.length} symbol(s) found`);
			for (const sym of symbols) {
				this.provideCodeLens(
					lenses,
					document,
					sym,
					languageScope as Required<CodeLensLanguageScope>,
					documentRangeFn,
					blame,
					gitUri,
					cfg,
					dirty,
					dirtyCommand,
				);
			}
		}

		if (
			(languageScope.scopes.includes(CodeLensScopes.Document) || languageScope.symbolScopes.includes('file')) &&
			!languageScope.symbolScopes.includes('!file')
		) {
			// Check if we have a lens for the whole document -- if not add one
			if (lenses.find(l => l.range.start.line === 0 && l.range.end.line === 0) == null) {
				const blameRange = documentRangeFn();

				let blameForRangeFn: (() => GitBlameLines | undefined) | undefined = undefined;
				if (dirty || cfg.recentChange.enabled) {
					if (!dirty) {
						blameForRangeFn = once(() => this.container.git.getBlameRange(blame!, gitUri, blameRange));
					}

					const fileSymbol = new SymbolInformation(
						gitUri.fileName,
						SymbolKind.File,
						'',
						new Location(gitUri.documentUri(), new Range(0, 0, 0, blameRange.start.character)),
					);
					lenses.push(
						new GitRecentChangeCodeLens(
							document.languageId,
							fileSymbol,
							gitUri,
							cfg.dateFormat,
							blameForRangeFn,
							blameRange,
							true,
							getRangeFromSymbol(fileSymbol),
							cfg.recentChange.command,
							dirtyCommand,
						),
					);
				}
				if (!dirty && cfg.authors.enabled) {
					if (blameForRangeFn === undefined) {
						blameForRangeFn = once(() => this.container.git.getBlameRange(blame!, gitUri, blameRange));
					}

					const fileSymbol = new SymbolInformation(
						gitUri.fileName,
						SymbolKind.File,
						'',
						new Location(gitUri.documentUri(), new Range(0, 1, 0, blameRange.start.character)),
					);
					lenses.push(
						new GitAuthorsCodeLens(
							document.languageId,
							fileSymbol,
							gitUri,
							blameForRangeFn,
							blameRange,
							true,
							getRangeFromSymbol(fileSymbol),
							cfg.authors.command,
						),
					);
				}
			}
		}

		return lenses;
	}

	private getValidateSymbolRange(
		symbol: SymbolInformation | DocumentSymbol,
		languageScope: Required<CodeLensLanguageScope>,
		documentRangeFn: () => Range,
		includeSingleLineSymbols: boolean,
	): Range | undefined {
		let valid = false;
		let range: Range | undefined;

		const symbolName = SymbolKind[symbol.kind].toLowerCase();
		switch (symbol.kind) {
			case SymbolKind.File:
				if (
					languageScope.scopes.includes(CodeLensScopes.Containers) ||
					languageScope.symbolScopes.includes(symbolName)
				) {
					valid = !languageScope.symbolScopes.includes(`!${symbolName}`);
				}

				if (valid) {
					// Adjust the range to be for the whole file
					range = documentRangeFn();
				}
				break;

			case SymbolKind.Package:
				if (
					languageScope.scopes.includes(CodeLensScopes.Containers) ||
					languageScope.symbolScopes.includes(symbolName)
				) {
					valid = !languageScope.symbolScopes.includes(`!${symbolName}`);
				}

				if (valid) {
					// Adjust the range to be for the whole file
					range = getRangeFromSymbol(symbol);
					if (range.start.line === 0 && range.end.line === 0) {
						range = documentRangeFn();
					}
				}
				break;

			case SymbolKind.Class:
			case SymbolKind.Interface:
			case SymbolKind.Module:
			case SymbolKind.Namespace:
			case SymbolKind.Struct:
				if (
					languageScope.scopes.includes(CodeLensScopes.Containers) ||
					languageScope.symbolScopes.includes(symbolName)
				) {
					range = getRangeFromSymbol(symbol);
					valid =
						!languageScope.symbolScopes.includes(`!${symbolName}`) &&
						(includeSingleLineSymbols || !range.isSingleLine);
				}
				break;

			case SymbolKind.Constructor:
			case SymbolKind.Enum:
			case SymbolKind.Function:
			case SymbolKind.Method:
			case SymbolKind.Property:
				if (
					languageScope.scopes.includes(CodeLensScopes.Blocks) ||
					languageScope.symbolScopes.includes(symbolName)
				) {
					range = getRangeFromSymbol(symbol);
					valid =
						!languageScope.symbolScopes.includes(`!${symbolName}`) &&
						(includeSingleLineSymbols || !range.isSingleLine);
				}
				break;

			case SymbolKind.String:
				if (
					languageScope.symbolScopes.includes(symbolName) ||
					// A special case for markdown files, SymbolKind.String seems to be returned for headers, so consider those containers
					(languageScope.language === 'markdown' && languageScope.scopes.includes(CodeLensScopes.Containers))
				) {
					range = getRangeFromSymbol(symbol);
					valid =
						!languageScope.symbolScopes.includes(`!${symbolName}`) &&
						(includeSingleLineSymbols || !range.isSingleLine);
				}
				break;

			default:
				if (languageScope.symbolScopes.includes(symbolName)) {
					range = getRangeFromSymbol(symbol);
					valid =
						!languageScope.symbolScopes.includes(`!${symbolName}`) &&
						(includeSingleLineSymbols || !range.isSingleLine);
				}
				break;
		}

		return valid ? range ?? getRangeFromSymbol(symbol) : undefined;
	}

	private provideCodeLens(
		lenses: CodeLens[],
		document: TextDocument,
		symbol: SymbolInformation | DocumentSymbol,
		languageScope: Required<CodeLensLanguageScope>,
		documentRangeFn: () => Range,
		blame: GitBlame | undefined,
		gitUri: GitUri | undefined,
		cfg: CodeLensConfig,
		dirty: boolean,
		dirtyCommand: Command | undefined,
	): void {
		try {
			const blameRange = this.getValidateSymbolRange(
				symbol,
				languageScope,
				documentRangeFn,
				cfg.includeSingleLineSymbols,
			);
			if (blameRange === undefined) return;

			const line = document.lineAt(getRangeFromSymbol(symbol).start);
			// Make sure there is only 1 lens per line
			if (lenses.length && lenses[lenses.length - 1].range.start.line === line.lineNumber) return;

			// Anchor the CodeLens to the start of the line -- so that the range won't change with edits (otherwise the CodeLens will be removed and re-added)
			let startChar = 0;

			let blameForRangeFn: (() => GitBlameLines | undefined) | undefined;
			if (dirty || cfg.recentChange.enabled) {
				if (!dirty) {
					blameForRangeFn = once(() => this.container.git.getBlameRange(blame!, gitUri!, blameRange));
				}
				lenses.push(
					new GitRecentChangeCodeLens(
						document.languageId,
						symbol,
						gitUri,
						cfg.dateFormat,
						blameForRangeFn,
						blameRange,
						false,
						line.range.with(new Position(line.range.start.line, startChar)),
						cfg.recentChange.command,
						dirtyCommand,
					),
				);
				startChar++;
			}

			if (cfg.authors.enabled) {
				let multiline = !blameRange.isSingleLine;
				// HACK for Omnisharp, since it doesn't return full ranges
				if (!multiline && document.languageId === 'csharp') {
					switch (symbol.kind) {
						case SymbolKind.File:
							break;
						case SymbolKind.Package:
						case SymbolKind.Module:
						case SymbolKind.Namespace:
						case SymbolKind.Class:
						case SymbolKind.Interface:
						case SymbolKind.Constructor:
						case SymbolKind.Method:
						case SymbolKind.Function:
						case SymbolKind.Enum:
							multiline = true;
							break;
					}
				}

				if (multiline && !dirty) {
					if (blameForRangeFn === undefined) {
						blameForRangeFn = once(() => this.container.git.getBlameRange(blame!, gitUri!, blameRange));
					}
					lenses.push(
						new GitAuthorsCodeLens(
							document.languageId,
							symbol,
							gitUri,
							blameForRangeFn,
							blameRange,
							false,
							line.range.with(new Position(line.range.start.line, startChar)),
							cfg.authors.command,
						),
					);
				}
			}
		} finally {
			if (isDocumentSymbol(symbol)) {
				for (const child of symbol.children) {
					this.provideCodeLens(
						lenses,
						document,
						child,
						languageScope,
						documentRangeFn,
						blame,
						gitUri,
						cfg,
						dirty,
						dirtyCommand,
					);
				}
			}
		}
	}

    private getDirtyTitle(cfg: CodeLensConfig) {
		if (cfg.recentChange.enabled && cfg.authors.enabled) {
			return this.container.config.strings.codeLens.unsavedChanges.recentChangeAndAuthors;
		}
		if (cfg.recentChange.enabled) return this.container.config.strings.codeLens.unsavedChanges.recentChangeOnly;
		return this.container.config.strings.codeLens.unsavedChanges.authorsOnly;
	}
}

function getRangeFromSymbol(symbol: DocumentSymbol | SymbolInformation) {
	return isDocumentSymbol(symbol) ? symbol.range : symbol.location.range;
}

function isDocumentSymbol(symbol: DocumentSymbol | SymbolInformation): symbol is DocumentSymbol {
	return is<DocumentSymbol>(symbol, 'children');
}
