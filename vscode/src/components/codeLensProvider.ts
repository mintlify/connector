import { CodeLensProvider, TextDocument, CancellationToken, ProviderResult, CodeLens, Range, Position, TextLine, Command } from 'vscode';
import GlobalState from '../utils/globalState';
import { getFilePath } from '../utils/git';
import { Link } from './links';

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
            return (link.type === 'file' || link.type === 'folder') && link.file === fileName || fileName.includes(link.file);
        });
        console.log({relatedLinks});
        if (relatedLinks.length > 0) {
            const firstLine = document.lineAt(0);
            const lastLine = document.lineAt(document.lineCount - 1);
            const range = new Range(firstLine.range.start, lastLine.range.end);
            const command: Command = {
                command: 'mintlify.open-doc',
                title: relatedLinks[0].doc?.title || 'Go to document',
                arguments: [relatedLinks[0]]
            };
            const lens: CodeLens = new CodeLens(range, command);
            return [lens];
        }
        return; // TODO - proper error handling
    }
}
