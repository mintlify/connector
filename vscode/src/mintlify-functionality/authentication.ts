import * as vscode from 'vscode';
import { GlobalState } from './utils/globalState';

// Register the global when clause for isLoggedIn
const setLoginContext = async (globalState: GlobalState) => {
	// Manage authentication states
	await vscode.commands.executeCommand('setContext', 'mintlify.isLoggedIn', globalState.getUserId() != null);
};
