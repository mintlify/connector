import { Commands } from '../../constants';
import type { Container } from '../../container';
import { Doc } from '../../mintlify/webview/viewProvider';
import { command, executeCommand } from '../../system/command';
import { Command } from '../base';

export interface PrefillDocArgs {
	doc?: Doc;
}

@command()
export class PrefillDoc extends Command {
	constructor(private readonly container: Container) {
		super(Commands.PrefillDoc);
	}

	async execute(args?: PrefillDocArgs) {
		const doc = args?.doc;
		if (doc == null) return;
		await executeCommand(Commands.PreviewDoc, { doc: doc });
		await this.container.viewProvider.prefillDoc(doc);
	}
}
