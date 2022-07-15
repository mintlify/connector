import axios from 'axios';
import { API_ENDPOINT } from './api';
import { GlobalState } from './globalState';

type Doc = {
	_id: string;
	org: string;
	url: string;
	method: string;
	favicon?: string;
	content?: string;
	title?: string;
	lastUpdatedAt: Date;
	createdAt: Date;
	changeConfirmationCount?: number;
	isJustAdded: boolean;
	createdBy?: string;
	// when method = notion-private
	notion?: {
		pageId: string;
	};
	// when method = googledocs-private
	googledocs?: {
		id: string;
	};
	// when method = confluence-private
	confluence?: {
		id: string;
	};
	slack?: boolean;
	email?: boolean;
};

export type Link = {
	_id: string;
	doc: Doc;
	sha: string;
	provider: string;
	file: string;
	org: string;
	gitOrg: string;
	repo: string;
	type: string;
	url: string;
	branch?: string;
	line?: number;
	endLine?: number;
};

export const getLinks = async (globalState: GlobalState): Promise<Link[]> => {
	const repo = globalState.getRepo();
	const gitOrg = globalState.getGitOrg();
	try {
		const codesResponse = await axios.get(`${API_ENDPOINT}/links`, {
			params: { ...globalState.getAuthParams(), repo: repo, gitOrg: gitOrg },
		});
		return codesResponse.data.codes;
	} catch (err) {
		// TODO - proper error handling
		return [];
	}
};

export const deleteLink = async (globalState: GlobalState, linkId?: string): Promise<void> => {
	if (!linkId) {
		return;
	}
	await axios.delete(`${API_ENDPOINT}/links/${linkId}`, {
		params: globalState.getAuthParams(),
	});
};

export const deleteDoc = async (globalState: GlobalState, docId: string): Promise<void> => {
	await axios.delete(`${API_ENDPOINT}/docs/${docId}`, {
		params: globalState.getAuthParams(),
	});
};

export const editDocName = async (globalState: GlobalState, docId: string, newName: string): Promise<void> => {
	await axios.put(
		`${API_ENDPOINT}/docs/${docId}/title`,
		{ title: newName },
		{
			params: globalState.getAuthParams(),
		},
	);
};
