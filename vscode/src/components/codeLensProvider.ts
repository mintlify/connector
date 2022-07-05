import { CodeLensProvider, TextDocument, CancellationToken, ProviderResult, CodeLens, Range, Command } from 'vscode';
import GlobalState from '../utils/globalState';
import { getFilePath } from '../utils/git';
import { Link } from '../utils/links';
import { Repository } from '../utils/types';
import { mapOldPositionToNew } from '../utils/diffPositionMapping';

export default class FileCodeLensProvider implements CodeLensProvider {

    constructor(
		private globalState: GlobalState,
        private _repository: Repository
	) {
	}
    async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
        const links : Link[] | undefined = this.globalState.getLinks();
        if (links == null || links?.length === 0) { return []; }
        const fileFsPath: string = document.uri.fsPath;
        const fileName = getFilePath(fileFsPath);
        // find link associated with this file
        const relatedLinks = links.filter((link) => {
            return link.file === fileName || fileName.includes(link.file) || link.file.includes(fileName);
        });
        const lensPromises: Promise<CodeLens | undefined>[] = relatedLinks.map(async (link) => {
		    const localDiff = await this._repository.diffWithHEAD(link.file);
            let firstLine = document.lineAt(0);
            let lastLine = document.lineAt(document.lineCount - 1);
            if (link.type === 'lines' && link?.line && link?.endLine) {
                if (document.isDirty) {
                    return;
                }
                if (localDiff) {
                    firstLine = document.lineAt(mapOldPositionToNew(localDiff, link.line));
                    lastLine = document.lineAt(mapOldPositionToNew(localDiff, link.endLine) - 1);
                } else {
                    firstLine = document.lineAt(link.line);
                    lastLine = document.lineAt(link.endLine - 1);
                }
            }
            const range = new Range(firstLine.range.start, lastLine.range.end);
            const title = this.formatTitle(link);
            const command: Command = {
                command: 'mintlify.open-doc',
                title,
                arguments: [link.doc.url]
            };
            const lens: CodeLens = new CodeLens(range, command);
            return lens;
        });

        const lenses = await Promise.all(lensPromises);

        return lenses.filter((lens) => lens != null) as CodeLens[]; // TODO - proper error handling
    }

    private formatTitle(link: Link): string {
        let formattedTitle = link.doc?.title;
        if (formattedTitle == null) {
            return 'Go to document';
        }
        if (formattedTitle.length > 30) {
            formattedTitle = formattedTitle.slice(0, 30) + '...';
        }
        return formattedTitle;
    }
}
