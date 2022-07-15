import axios from 'axios';
import { window } from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { Doc } from '../../mintlify-functionality/utils/types';
import { command, executeCommand } from '../../system/command';
import { Command } from '../base';

// TODO - figure out if this is good
export interface DeleteDocCommandArgs {
	doc?: Doc;
}

@command()
export class DeleteDoc extends Command {
	constructor(private readonly container: Container) {
		super(Commands.DeleteDoc);
	}

	async execute(args?: DeleteDocCommandArgs) {
		args = { ...args };
		const response = await window.showInformationMessage(
			`Are you sure you would like to delete ${args?.doc?.title}? This cannot be undone`,
			'Delete',
			'Cancel',
		);
		if (response !== 'Delete') {
			return;
		}
		await this.deleteDoc(args?.doc?._id);
		await executeCommand(Commands.RefreshViews);
		await executeCommand(Commands.RefreshLinks);
	}

	deleteDoc = async (docId?: string): Promise<void> => {
		if (!docId) {
			return;
		}
		const authParams = await this.container.storage.getAuthParams();
		await axios.delete(`${API_ENDPOINT}/docs/${docId}`, {
			params: authParams,
		});
	};
}
