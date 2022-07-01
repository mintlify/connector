import * as vscode from 'vscode';

import { ViewProvider } from './viewProvider';
import { getGitData, getRepoInfo } from '../utils/git';
import { getHighlightedText } from '../utils';
import GlobalState from '../utils/globalState';
import { getLinks } from '../utils/links';

export const linkCodeCommand = (provider: ViewProvider) => {
    return vscode.commands.registerCommand('mintlify.link-code', async (args) => {
        const window = vscode.window;
        const editor = args.editor || window.activeTextEditor;

        const { scheme } = args;
        if (scheme !== 'file') {
            return;
        }

        if (editor) {
            const fileFsPath: string = editor.document.uri.fsPath;
            const { selection, highlighted } = getHighlightedText(editor);
            if (highlighted) {
                const selectedLines: number[] = [selection.start.line, selection.end.line];
                await getGitData(fileFsPath, provider, 'lines', selectedLines);
            } else {
                await getGitData(fileFsPath, provider, 'file');
            }
        }
    });
};

const getIsFolder = (fileStat: vscode.FileStat): boolean => fileStat.type === 2;
const getIsFile = (fileStat: vscode.FileStat): boolean => fileStat.type === 1;

export const linkDirCommand = (provider: ViewProvider) => {
    return vscode.commands.registerCommand('mintlify.link-dir', async (args) => {
        const { path, scheme } = args;
        if (scheme !== 'file') {
            return;
        }
        const uri: vscode.Uri = vscode.Uri.file(path);

        // most likely evoked from sidebar
        // figure out if it's a folder or file, get git info (git blame)
        const fileStat: vscode.FileStat = await vscode.workspace.fs.stat(uri);
        const isFolder = getIsFolder(fileStat);
        if (isFolder) {
            // git stuff for folder
            const fileFsPath: string = uri.fsPath;
            await getGitData(fileFsPath, provider, 'folder');
        }
        const isFile = getIsFile(fileStat);
        if (isFile) {
            // git stuff for file
            const fileFsPath: string = uri.fsPath;
            await getGitData(fileFsPath, provider, 'file');
        }
    });
};

export const refreshLinksCommand = (globalState: GlobalState) => {
    return vscode.commands.registerCommand('mintlify.refresh-links', async (args) => {
        const window = vscode.window;
        const editor = args?.editor || window.activeTextEditor;
        const fileFsPath: string = editor.document.uri.fsPath;
        const { gitOrg, repo } = await getRepoInfo(fileFsPath);
        globalState.setGitOrg(gitOrg);
        globalState.setRepo(repo);
        console.log({gitOrg});
        console.log({repo});
        const links = await getLinks(globalState);
        globalState.setLinks(links);
        console.log('links refreshed: ', links);
    });
};

export const openDocsCommand = () => {
    return vscode.commands.registerCommand('mintlify.open-doc', async (url) => {
        vscode.env.openExternal(vscode.Uri.parse(url));
    });
};
