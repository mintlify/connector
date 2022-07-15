import { Commands } from '../../constants';
import type { Container } from '../../container';
import { command } from '../../system/command';
import { Command } from '../base';

@command()
export class RefreshViews extends Command {
	constructor(private readonly container: Container) {
		super(Commands.RefreshViews);
	}

	execute() {
		this.container.documentsTreeProvider.refresh();
		this.container.connectionsTreeProvider.refresh();
		this.container.teamTreeProvider.refresh();
	}
}
