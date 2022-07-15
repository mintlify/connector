import axios from 'axios';
import * as vscode from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { command } from '../../system/command';
import { Command } from '../base';

@command()
export class InviteMember extends Command {
	constructor(private readonly container: Container) {
		super(Commands.InviteMember);
	}

	async execute() {
		const memberEmail = await vscode.window.showInputBox({
			title: 'Invite member by email',
			placeHolder: 'hi@example.com',
			validateInput: (email: string) => {
				const isValidEmail = email
					.toLowerCase()
					.match(
						/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
					);

				if (isValidEmail != null) {
					return null;
				}

				return 'Invalid email address';
			},
		});

		if (!memberEmail) {
			return;
		}

		try {
			const authParams = await this.container.storage.getAuthParams();
			await axios.post(
				`${API_ENDPOINT}/user/invite`,
				{
					emails: [memberEmail],
					isVSCode: true,
				},
				{
					params: authParams,
				},
			);
			await vscode.window.showInformationMessage(`Invited ${memberEmail} to your team`);
			await vscode.commands.executeCommand('mintlify.refresh-views');
		} catch (error) {
			await vscode.window.showInformationMessage('Error occurred while inviting member');
		}
	}
}
