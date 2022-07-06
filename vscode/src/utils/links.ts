import axios from 'axios';
import { API_ENDPOINT } from './api';
import GlobalState from './globalState';

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
    createdBy?: string,
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
    }
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
    const subdomain = globalState.getSubdomain();
    const userId = globalState.getUserId();
    if (subdomain == null || userId == null) { return []; } // TODO - proper error handling
    const repo = globalState.getRepo();
    const gitOrg = globalState.getGitOrg();
    try {
        const codesResponse = await axios.get(`${API_ENDPOINT}/links`, {
            params: { userId, subdomain, repo, gitOrg }
        });
        return codesResponse.data.codes;
    } catch (err) {
        console.log(err);
        return [];
    }

};

export const deleteLink = async (globalState: GlobalState, linkId?: string): Promise<void> => {
    if (!linkId) {
        return;
    }
    const subdomain = globalState.getSubdomain();
    const userId = globalState.getUserId();
    if (subdomain == null || userId == null) {return;} // TODO - proper error handling
    await axios.delete(`${API_ENDPOINT}/links/${linkId}`, {
        params: {
            userId,
            subdomain,
        }
    });
};

export const deleteDoc = async (globalState: GlobalState, docId: string): Promise<void> => {
    const subdomain = globalState.getSubdomain();
    const userId = globalState.getUserId();
    if (subdomain == null || userId == null) {return;}
    await axios.delete(`${API_ENDPOINT}/docs/${docId}`, {
        params: {
            userId,
            subdomain,
        }
    });
};