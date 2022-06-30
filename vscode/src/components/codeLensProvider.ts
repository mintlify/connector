import { CodeLensProvider, TextDocument, CancellationToken, ProviderResult, CodeLens } from 'vscode';
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
        if (relatedLinks.length > 0) {
            // return relatedLinks[0]
        }
        return;
    }
}
