import axios from 'axios';
import { commands, window } from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { Doc } from '../../mintlify-functionality/utils/types';
import { command } from '../../system/command';
import { Command } from '../base';

// TODO - figure out if this is good
export interface RenameDocCommandArgs {
	doc?: Doc;
}

@command()
export class RenameDoc extends Command {
	constructor(private readonly container: Container) {
		super(Commands.RenameDoc);
	}

	async execute(args?: RenameDocCommandArgs) {
		args = { ...args };
		const newName = await window.showInputBox({
			title: 'Edit name of document',
			value: args?.doc?.title,
			placeHolder: args?.doc?.title,
		});

		if (!newName) {
			return window.showErrorMessage('New name cannot be empty');
		}

		await this.editDocName(newName, args?.doc?._id);
		await window.showInformationMessage(`Document has been renamed to ${newName}`);
		await commands.executeCommand('mintlify.refresh-views');
		return commands.executeCommand('mintlify.refresh-links');
	}

	editDocName = async (newName: string, docId?: string): Promise<void> => {
		if (!docId) {
			return;
		}
		const authParams = await this.container.storage.getAuthParams();
		await axios.put(
			`${API_ENDPOINT}/docs/${docId}/title`,
			{ title: newName },
			{
				params: authParams,
			},
		);
	};
}
