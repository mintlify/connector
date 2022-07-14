import axios from 'axios';
import { window } from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { Code } from '../../mintlify-functionality/utils/git';
import { command, executeCommand } from '../../system/command';
import { Command } from '../base';

// TODO - figure out if this is good
export interface DeleteLinkCommandArgs {
	code?: Code;
}

@command()
export class DeleteLink extends Command {
	constructor(private readonly container: Container) {
		super(Commands.DeleteLink);
	}

	async execute(args?: DeleteLinkCommandArgs) {
		args = { ...args };
		const response = await window.showInformationMessage(
			`Are you sure you would like to delete the connection? This cannot be undone`,
			'Delete',
			'Cancel',
		);
		if (response !== 'Delete') {
			return;
		}
		await this.deleteLink(args?.code?._id);
		this.container.connectionsTreeProvider.refresh();
		await executeCommand(Commands.RefreshLinks);
	}

	deleteLink = async (linkId?: string): Promise<void> => {
		if (!linkId) {
			return;
		}
		const authParams = await this.container.storage.getAuthParams();
		await axios.delete(`${API_ENDPOINT}/links/${linkId}`, {
			params: authParams,
		});
	};
}
