import { CodeLensProvider, TextDocument, CancellationToken, ProviderResult, CodeLens } from 'vscode';
import GlobalState from '../utils/globalState';

export default class FileCodeLensProvider implements CodeLensProvider {
    private globalState: GlobalState;

    constructor(
		globalState: GlobalState
	) {
		this.globalState = globalState;
	}
    public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        return;
    }
}
