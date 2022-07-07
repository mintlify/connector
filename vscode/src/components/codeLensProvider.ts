import { CodeLensProvider, TextDocument, CancellationToken, CodeLens, Range, Command, Uri, Event, EventEmitter } from 'vscode';
import * as vscode from 'vscode';
import GlobalState from '../utils/globalState';
import { getFilePath } from '../utils/git';
import { Link } from '../utils/links';
import { Repository } from '../utils/git/types';
import { GitApiImpl } from '../utils/git/gitApiImpl';
import { mapOldPositionToNew } from '../utils/git/diffPositionMapping';

export default class FileCodeLensProvider implements CodeLensProvider {
    private _document: TextDocument;
    private _lenses: CodeLens[] = [];

    constructor(
        private _globalState: GlobalState,
        private _repository: Repository,
        private _git: GitApiImpl
    ) {
    }

    async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
        this._document = document;
        await this.refreshCodeLenses();
        return this._lenses;
    }

    async refreshCodeLenses() {
        const links: Link[] | undefined = this._globalState.getLinks();
        if (links == null || links?.length === 0) { return []; }
        const fileFsPath: string = this._document.uri.fsPath;
        const fileName = getFilePath(fileFsPath);
        // find link associated with this file
        const relatedLinks = links.filter((link) => {
            return link.file === fileName || fileName.includes(link.file) || link.file.includes(fileName);
        });
        const lensPromises: Promise<CodeLens | undefined>[] = relatedLinks.map(async (link) => {
            let firstLine = this._document.lineAt(0);
            let lastLine = this._document.lineAt(this._document.lineCount - 1);
            if (link.type === 'lines' && link?.line && link?.endLine) {
                if (this._document.isDirty) {
                    return;
                }
                if (this._git.state !== 'uninitialized') {
                    const diff = await this.getContentDiff(this._document.uri, fileName, link.sha);
                    if (diff) {
                        firstLine = this._document.lineAt(mapOldPositionToNew(diff, link.line));
                        lastLine = this._document.lineAt(mapOldPositionToNew(diff, link.endLine) - 1);
                    } else {
                        firstLine = this._document.lineAt(link.line);
                        lastLine = this._document.lineAt(link.endLine - 1);
                    }
                }
            }
            if (lastLine.lineNumber > this._document.lineCount - 1) {
                lastLine = this._document.lineAt(this._document.lineCount - 1);
            }
            if (firstLine.lineNumber < 0) {
                firstLine = this._document.lineAt(0);
            }
            const range = new Range(firstLine.range.start, lastLine.range.end);
            const title = this.formatTitle(link);
            const command: Command = {
                command: 'mintlify.open-doc',
                title,
                arguments: [link.doc.url]
            };
            const lens: CodeLens = new CodeLens(range, command);
            return lens;
        });

        const lenses = await Promise.all(lensPromises);

        this._lenses = lenses.filter((lens) => lens != null) as CodeLens[]; // TODO - proper error handling
    }

    private formatTitle(link: Link): string {
        let formattedTitle = link.doc?.title;
        if (formattedTitle == null) {
            return 'Go to document';
        }
        if (formattedTitle.length > 30) {
            formattedTitle = formattedTitle.slice(0, 30) + '...';
        }
        return formattedTitle;
    }

    private async getContentDiff(uri: Uri, fileName: string, sha: string): Promise<string> {
        const matchedEditor = vscode.window.visibleTextEditors.find(
            editor => editor.document.uri.toString() === uri.toString(),
        );
        if (matchedEditor && matchedEditor.document.isDirty) {
            const documentText = matchedEditor.document.getText();
            const idOfCurrentText = await this._repository.hashObject(documentText);
            return await this._repository.diffBlobs(sha, idOfCurrentText);
        } else {
            return await this._repository.diffWith(sha, fileName);
        }
    }
}
