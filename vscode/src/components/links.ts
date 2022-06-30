import vscode from 'vscode';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import GlobalState from '../utils/globalState';

export type Link = {
    _id: string;
    doc: Object;
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
    try {
        const codesResponse = await axios.get(`${API_ENDPOINT}/links`, {
            params: { userId, subdomain }
        });
        return codesResponse.data.codes;
    } catch (err) {
        console.log(err);
        return [];
    }

};

export const refreshLinkCommand = (globalState: GlobalState) => {
    return vscode.commands.registerCommand('mintlify.refresh-links', async () => {
        const links = await getLinks(globalState);
        globalState.setLinks(links);
    });
};