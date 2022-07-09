import { CodeLensProvider, TextDocument, CancellationToken, ProviderResult, CodeLens, Range, Command } from 'vscode';
import GlobalState from '../utils/globalState';
import { getFilePath } from '../utils/git';
import { Link } from '../utils/links';

export default class FileCodeLensProvider implements CodeLensProvider {
    private globalState: GlobalState;

    constructor(
		globalState: GlobalState
	) {
		this.globalState = globalState;
	}
    public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        const links : Link[] | undefined = this.globalState.getLinks();
        if (links == null || links?.length === 0) { return; }
        const fileFsPath: string = document.uri.fsPath;
        const fileName = getFilePath(fileFsPath);
        // find link associated with this file
        const relatedLinks = links.filter((link) => {
            return link.file === fileName || fileName.includes(link.file);
        });
        const lenses: CodeLens[] = relatedLinks.map((link) => {
            let firstLine = document.lineAt(0);
            let lastLine = document.lineAt(document.lineCount - 1);
            const range = new Range(firstLine.range.start, lastLine.range.end);
            const title = this.formatTitle(link);
            const command: Command = {
                command: 'mintlify.preview-doc',
                title,
                arguments: [link.doc]
            };
            const lens: CodeLens = new CodeLens(range, command);
            return lens;
        });

        return lenses; // TODO - proper error handling
    }

    private formatTitle(link: Link): string {
        let formattedTitle = link.doc?.title;
        if (formattedTitle == null) {
            return 'Go to document';
        }
        if (formattedTitle.length > 30) {
            formattedTitle = formattedTitle.slice(0, 30) + '...';
        }
        if (link?.line || link?.endLine) {
            const lines = ` (${link.line}-${link.endLine})`;
            formattedTitle = formattedTitle + lines;
        }
        return formattedTitle;
    }
}
