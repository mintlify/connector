import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	Command,
	DocumentSelector,
	Event,
	EventEmitter,
	Range,
	TextDocument,
} from 'vscode';
import { LocalGitProvider } from '@env/git/localGitProvider';
import type { Repository as BuiltInGitRepository } from '../../@types/vscode.git';
import { Commands, ContextKeys, Schemes } from '../../constants';
import { Container } from '../../container';
import { getContext } from '../../context';
import { GitProviderId } from '../../git/gitProvider';
import { getFilePath } from '../../mintlify-functionality/utils/git';
import { mapOldPositionToNew } from '../../mintlify-functionality/utils/git/diffPositionMapping';
import { Link } from '../../mintlify-functionality/utils/links';

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

		const lenses: CodeLens[] = [];

		const links: Link[] | undefined = getContext<Link[]>(ContextKeys.Links);
		if (links == null || links?.length === 0) {
			return lenses;
		}
		const fileFsPath: string = document.uri.fsPath;
		const fileName = getFilePath(fileFsPath);
		const relatedLinks = links.filter(link => {
			return link.file === fileName || fileName.includes(link.file) || link.file.includes(fileName);
		});

		const gitProviders = this.container.git.getOpenProviders();

		const git: LocalGitProvider | undefined = gitProviders.find(
			provider => provider.descriptor.id === GitProviderId.Git,
		) as LocalGitProvider;
		let repo: BuiltInGitRepository | undefined;
		if (git != null) {
			repo = await git.openScmRepository(document.uri);
		}

		// TODO - seprate promises from non-promise lenses
		const lensPromises: Promise<CodeLens | undefined>[] = relatedLinks.map(async link => {
			let firstLine = document.lineAt(0);
			let lastLine = document.lineAt(document.lineCount - 1);
			if (link.type === 'lines' && link?.line && link?.endLine) {
				if (document.isDirty) {
					return;
				}
				try {
					if (repo != null) {
						const diff = await this.getContentDiff(repo, document, fileName, link.sha);
						if (diff != null) {
							firstLine = document.lineAt(mapOldPositionToNew(diff, link.line));
							lastLine = document.lineAt(mapOldPositionToNew(diff, link.endLine) - 1);
						}
					}
				} catch {
					return;
				}
			}
			if (lastLine.lineNumber > document.lineCount - 1) {
				lastLine = document.lineAt(document.lineCount - 1);
			}
			if (firstLine.lineNumber < 0) {
				firstLine = document.lineAt(0);
			}
			const range = new Range(firstLine.range.start, lastLine.range.end);
			const title = this.formatTitle(link);
			const command: Command = {
				command: Commands.PreviewDoc,
				title: title,
				arguments: [{ doc: link.doc }],
			};
			const lens: CodeLens = new CodeLens(range, command);
			return lens;
		});

		if (token.isCancellationRequested) return lenses;

		const resolvedLenses = await Promise.all(lensPromises);
		const filteredLens = resolvedLenses.filter(lens => lens != null) as CodeLens[];

		return filteredLens;
	}

	private formatTitle(link: Link): string {
		let formattedTitle = link.doc?.title;
		if (formattedTitle == null) {
			return 'Go to document';
		}
		if (formattedTitle.length > 30) {
			formattedTitle = `${formattedTitle.slice(0, 30)}...`;
		}
		return formattedTitle;
	}

	private async getContentDiff(
		repo: BuiltInGitRepository,
		document: TextDocument,
		fileName: string,
		sha: string,
	): Promise<string> {
		if (document.isDirty) {
			const documentText = document.getText();
			const idOfCurrentText = await repo.hashObject(documentText);
			return repo.diffBlobs(sha, idOfCurrentText);
		}
		return repo.diffWith(sha, fileName);
	}
}
