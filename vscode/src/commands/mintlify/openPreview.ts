import axios from 'axios';
import * as vscode from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { API_ENDPOINT } from '../../mintlify-functionality/utils/api';
import { Doc } from '../../mintlify/webview/viewProvider';
import { command } from '../../system/command';
import { Command } from '../base';

export interface OpenPreviewCommandArgs {
	doc?: Doc;
}

@command()
export class OpenPreview extends Command {
	constructor(private readonly container: Container) {
		super(Commands.PreviewDoc);
	}

	async execute(args?: OpenPreviewCommandArgs) {
		const doc = args?.doc;
		if (doc == null) return;

		const panel = vscode.window.createWebviewPanel(
			'mintlify.preview',
			doc.title,
			{
				viewColumn: vscode.ViewColumn.Two,
				preserveFocus: true,
			},
			{
				enableScripts: true,
			},
		);

		try {
			const url = doc.url;
			const authParams = await this.container.storage.getAuthParams();
			const { data: hyperbeamIframeUrl } = await axios.get(`${API_ENDPOINT}/links/iframe`, {
				params: {
					...authParams,
					url: url,
				},
			});
			const iframe = `<iframe src="${hyperbeamIframeUrl}" style="position:fixed;border:0;width:100%;height:100%"></iframe>`;
			panel.webview.html = iframe;
		} catch {
			panel.dispose();
			await vscode.env.openExternal(vscode.Uri.parse(doc.url));
		}
	}
}
