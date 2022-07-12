import * as vscode from 'vscode';
import { Code } from '../utils/git';
import { GlobalState } from '../utils/globalState';
import { deleteDoc, deleteLink, editDocName } from '../utils/links';
import { ConnectionsTreeProvider } from './connections';
import { DocumentsTreeProvider } from './documents';
import { TeamTreeProvider } from './team';

export const createTreeViews = (globalState: GlobalState): void => {
	const documentsTreeProvider = new DocumentsTreeProvider(globalState);
	const connectionsTreeProvider = new ConnectionsTreeProvider(globalState);
	const teamTreeProvider = new TeamTreeProvider(globalState);
	vscode.window.createTreeView('documents', { treeDataProvider: documentsTreeProvider });
	vscode.window.createTreeView('connections', { treeDataProvider: connectionsTreeProvider });
	vscode.window.createTreeView('teammates', { treeDataProvider: teamTreeProvider });

	vscode.commands.registerCommand('mintlify.refresh-views', () => {
		documentsTreeProvider.refresh();
		connectionsTreeProvider.refresh();
		teamTreeProvider.refresh();
	});

	vscode.commands.registerCommand('mintlify.delete-connection', async (connection: { code: Code }) => {
		const response = await vscode.window.showInformationMessage(
			`Are you sure you would like to delete the connection? This cannot be undone`,
			'Delete',
			'Cancel',
		);
		if (response !== 'Delete') {
			return;
		}
		await deleteLink(globalState, connection.code._id);
		connectionsTreeProvider.refresh();
		await vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.commands.registerCommand('mintlify.rename-document', async docOption => {
		const newName = await vscode.window.showInputBox({
			title: 'Edit name of document',
			value: docOption.doc.title,
			placeHolder: docOption.doc.title,
		});

		if (!newName) {
			return vscode.window.showErrorMessage('New name cannot be empty');
		}

		await editDocName(globalState, docOption.doc._id, newName);
		await vscode.window.showInformationMessage(`Document has been renamed to ${newName}`);
		await vscode.commands.executeCommand('mintlify.refresh-views');
		return vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.commands.registerCommand('mintlify.delete-document', async docOption => {
		const response = await vscode.window.showInformationMessage(
			`Are you sure you would like to delete ${docOption.doc.title}? This cannot be undone`,
			'Delete',
			'Cancel',
		);
		if (response !== 'Delete') {
			return;
		}
		await deleteDoc(globalState, docOption.doc._id);
		await vscode.commands.executeCommand('mintlify.refresh-views');
		await vscode.commands.executeCommand('mintlify.refresh-links');
	});

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor == null) {
			return;
		}
		connectionsTreeProvider.refresh();
	});
};
