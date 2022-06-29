import { CodeLensProvider, TextDocument, CancellationToken, ProviderResult, CodeLens } from 'vscode';
import { AuthService } from './authentication';

export default class FileCodeLensProvider implements CodeLensProvider {
    private authService: AuthService;

    constructor(
		authService: AuthService
	) {
		this.authService = authService;
	}
    public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        return;
    }
}
