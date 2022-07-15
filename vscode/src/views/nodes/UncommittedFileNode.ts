import { Command, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { DiffWithPreviousCommandArgs } from '../../commands';
import { Commands } from '../../constants';
import { StatusFileFormatter } from '../../git/formatters';
import { GitUri } from '../../git/gitUri';
import { GitFile } from '../../git/models';
import { dirname, joinPaths } from '../../system/path';
import { ViewsWithCommits } from '../viewBase';
import { FileNode } from './folderNode';
import { ContextValues, ViewNode } from './viewNode';

export class UncommittedFileNode extends ViewNode<ViewsWithCommits> implements FileNode {
	public readonly file: GitFile;
	public readonly repoPath: string;

	constructor(view: ViewsWithCommits, parent: ViewNode, repoPath: string, file: GitFile) {
		super(GitUri.fromFile(file, repoPath), view, parent);

		this.repoPath = repoPath;
		this.file = file;
	}

	override toClipboard(): string {
		return this.path;
	}

	get path(): string {
		return this.file.path;
	}

	getChildren(): ViewNode[] {
		return [];
	}

	getTreeItem(): TreeItem {
		const item = new TreeItem(this.label, TreeItemCollapsibleState.None);
		item.contextValue = ContextValues.File;
		item.description = this.description;
		// Use the file icon and decorations
		item.resourceUri = this.view.container.git.getAbsoluteUri(this.file.path, this.repoPath);

		const icon = GitFile.getStatusIcon(this.file.status);
		item.iconPath = {
			dark: this.view.container.context.asAbsolutePath(joinPaths('images', 'dark', icon)),
			light: this.view.container.context.asAbsolutePath(joinPaths('images', 'light', icon)),
		};

		item.tooltip = StatusFileFormatter.fromTemplate(
			`\${file}\n\${directory}/\n\n\${status}\${ (originalPath)}`,
			this.file,
		);

		item.command = this.getCommand();

		// Only cache the label/description for a single refresh
		this._label = undefined;
		this._description = undefined;

		return item;
	}

	private _description: string | undefined;
	get description() {
		if (this._description == null) {
			this._description = StatusFileFormatter.fromTemplate(
				this.view.config.formats.files.description,
				{ ...this.file },
				{ relativePath: this.relativePath },
			);
		}
		return this._description;
	}

	private _folderName: string | undefined;
	get folderName() {
		if (this._folderName == null) {
			this._folderName = dirname(this.uri.relativePath);
		}
		return this._folderName;
	}

	private _label: string | undefined;
	get label() {
		if (this._label == null) {
			this._label = StatusFileFormatter.fromTemplate(
				`\${file}`,
				{ ...this.file },
				{ relativePath: this.relativePath },
			);
		}
		return this._label;
	}

	get priority(): number {
		return 0;
	}

	private _relativePath: string | undefined;
	get relativePath(): string | undefined {
		return this._relativePath;
	}
	set relativePath(value: string | undefined) {
		this._relativePath = value;
		this._label = undefined;
		this._description = undefined;
	}

	override getCommand(): Command | undefined {
		const commandArgs: DiffWithPreviousCommandArgs = {
			uri: GitUri.fromFile(this.file, this.repoPath),
			line: 0,
			showOptions: {
				preserveFocus: true,
				preview: true,
			},
		};
		return {
			title: 'Open Changes with Previous Revision',
			command: Commands.DiffWithPrevious,
			arguments: [undefined, commandArgs],
		};
	}
}
