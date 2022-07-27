import { FileStat, TextEditor, Uri, window, workspace } from 'vscode';
import { Commands } from '../../constants';
import type { Container } from '../../container';
import { GitUri } from '../../git/gitUri';
import { Logger } from '../../logger';
import { Messages } from '../../messages';
import { getHighlightedText } from '../../mintlify-functionality/utils';
import { Code, getGitData } from '../../mintlify-functionality/utils/git';
import { command } from '../../system/command';
import { first } from '../../system/iterable';
import {
	ActiveEditorCommand,
	CommandContext,
	getCommandUri,
	isCommandContextViewNodeHasBranch,
	isCommandContextViewNodeHasCommit,
	isCommandContextViewNodeHasTag,
} from '../base';

export interface LinkCommandArgs {
	command?: string;
	sha?: string;
}

@command()
export class LinkCode extends ActiveEditorCommand {
	constructor(private readonly container: Container) {
		super([Commands.LinkCode, Commands.LinkDir]);
	}

	protected override preExecute(context: CommandContext, args?: LinkCommandArgs) {
		args = { ...args };
		const { uri } = context;
		let command;
		switch (context.command) {
			case Commands.LinkCode:
				command = 'code';
				break;
			case Commands.LinkDir:
				command = 'dir';
				break;
		}
		args.command = command;
		if (isCommandContextViewNodeHasCommit(context)) {
			args.sha = this.container.config.advanced.abbreviateShaOnCopy
				? context.node.commit.shortSha
				: context.node.commit.sha;
			return this.execute(
				context.editor,
				command === 'code' ? context.node.commit.file?.uri ?? context.node.commit.getRepository()?.uri : uri,
				args,
			);
		} else if (isCommandContextViewNodeHasBranch(context)) {
			args.sha = context.node.branch.sha;
			return this.execute(context.editor, command === 'code' ? context.node.uri : uri, args);
		} else if (isCommandContextViewNodeHasTag(context)) {
			args.sha = context.node.tag.sha;
			return this.execute(context.editor, command === 'code' ? context.node.uri : uri, args);
		}

		return this.execute(context.editor, uri, args);
	}

	async execute(editor?: TextEditor, uri?: Uri, args?: LinkCommandArgs) {
		if (args?.command === 'code') {
			uri = getCommandUri(uri, editor);
			args = { ...args };
			const activeEditor = editor ?? window.activeTextEditor;
			if (activeEditor == null) {
				return;
			}
			const fileFsPath: string = activeEditor.document.uri.fsPath;
			const { selection, highlighted } = getHighlightedText(activeEditor);
			if (highlighted) {
				const selectedLines: number[] = [selection.start.line, selection.end.line];

				const code: Code = await this.getCode(fileFsPath, 'lines', activeEditor, uri, args, selectedLines);
				await this.container.viewProvider.postCode(code);
			} else {
				const code: Code = await this.getCode(fileFsPath, 'file', activeEditor, uri, args);
				await this.container.viewProvider.postCode(code);
			}
		} else {
			if (uri == null) return;
			const fileStat: FileStat = await workspace.fs.stat(uri);
			const type = this.getIsFolder(fileStat) ? 'folder' : 'file';
			const fileFsPath: string = uri.fsPath;
			const code: Code = await this.getCode(fileFsPath, type, editor, uri, args);
			await this.container.viewProvider.show();
			function delay(time: number) {
				return new Promise(resolve => setTimeout(resolve, time));
			}
			await delay(200);
			await this.container.viewProvider.postCode(code);
		}
	}

	private async getCode(
		fileFsPath: string,
		type: string,
		editor?: TextEditor,
		uri?: Uri,
		args?: LinkCommandArgs,
		lines?: number[],
	): Promise<Code> {
		const code: Code = await getGitData(fileFsPath, type, lines);
		// const sha = await this.getSha(editor, uri, args);
		// if (sha != null) {
		// 	code.sha = sha;
		// }
		return code;
	}

	private async getSha(editor?: TextEditor, uri?: Uri, args?: LinkCommandArgs): Promise<string | undefined> {
		args = { ...args };
		try {
			if (!args.sha) {
				// If we don't have an editor then get the sha of the last commit to the branch
				if (uri == null) {
					const repoPath = this.container.git.getBestRepository(editor)?.path;
					if (!repoPath) return;

					const log = await this.container.git.getLog(repoPath, { limit: 1 });
					if (log == null) return;

					args.sha = first(log.commits.values()).sha;
				} else if (args?.sha == null) {
					const blameline = editor?.selection.active.line ?? 0;
					if (blameline < 0) return;

					try {
						const gitUri = await GitUri.fromUri(uri);
						const blame = await this.container.git.getBlameForLine(gitUri, blameline, editor?.document);
						if (blame == null) return;

						args.sha = blame.commit.sha;
					} catch (ex) {
						Logger.error(ex, 'LinkCode', `getBlameForLine(${blameline})`);
						void Messages.showGenericErrorMessage('Unable to get commit SHA');

						return;
					}
				}
			}
			return args.sha;
		} catch (ex) {
			Logger.error(ex, 'LinkCode');
			void Messages.showGenericErrorMessage('Unable to get commit SHA');
		}
		return undefined;
	}

	private getIsFolder = (fileStat: FileStat): boolean => fileStat.type === 2;
}
