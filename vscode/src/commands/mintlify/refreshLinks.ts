import axios from 'axios';
import { TextEditor } from 'vscode';
import { Commands, ContextKeys } from '../../constants';
import type { Container } from '../../container';
import { setContext } from '../../context';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { getRepoInfo } from '../../mintlify-functionality/utils/git';
import { command } from '../../system/command';
import { ActiveEditorCommand } from '../base';

@command()
export class RefreshLinks extends ActiveEditorCommand {
	constructor(private readonly container: Container) {
		super(Commands.RefreshLinks);
	}

	async execute(editor: TextEditor) {
		const fileFsPath: string = editor.document.uri.fsPath;
		const { gitOrg, repo } = await getRepoInfo(fileFsPath);
		try {
			const codesResponse = await axios.get(`${API_ENDPOINT}/links`, {
				params: { ...this.container.storage.getAuthParams(), repo: repo, gitOrg: gitOrg },
			});
			await setContext(ContextKeys.Links, codesResponse.data.codes);
		} catch (err) {
			// TODO - proper error handling
		}
	}
}
