import axios from 'axios';
import { urlify } from './links';
import { isNotionUrl, isBlock, getNotionBlockContent, getNotionPageTitle } from '../../services/notion';
import { Link } from '../github/types';
import { AuthConnectorType } from '../../models/AuthConnector';

export const getDocumentNameFromUrl = async (url: string) => {
    try {
        const urlWithOutProtocol = url.replace(/(^\w+:|^)\/\//, '');
        const urlWithHttp = 'http://' + urlWithOutProtocol;
        const { data: rawText }: { data: string } = await axios.get(urlWithHttp);
        const matches = rawText.match(/<title>(.+)<\/title>/)
        const title = matches ? matches[1] : 'this document'
        return title;
    }
    catch {
        return 'this document';
    }
}

export const getDocumentTitle = async (link: Link, authConnector?: AuthConnectorType): Promise<string> => {
    const url = new URL(urlify(link.url));
    if (isNotionUrl(url) && authConnector?.notion) {
        const pageTitle = await getNotionPageTitle(link, authConnector.notion.accessToken);
        if (pageTitle !== '') {
            return pageTitle;
        }
    }
    return getDocumentNameFromUrl(urlify(link.url));
}

export const createMessageContent = async (link: Link, linkText: string, kind?: string, content?: string): Promise<string> => {
    const url = urlify(link.url);
    const contentMessage = content ? `\n> ${content}` : '';
    if (kind === 'notionPage') {
        return `Does the page [${linkText}](${url}) need to be updated?`;
    } else if (kind === 'notionBlock') {
        return `Does the following block in [${linkText}](${url}) need to be updated?${contentMessage}`
    }

    return `Does [${linkText}](${url}) need to be updated?${contentMessage}`;
}

export const createMessage = async (link: Link, authConnector?: AuthConnectorType): Promise<string> => {
    const linkText = await getDocumentTitle(link, authConnector);
    const url = new URL(urlify(link.url));
    if (isNotionUrl(url) && authConnector?.notion) {
        const isblock = isBlock(url);
        if (isblock) {
            const blockContent = await getNotionBlockContent(link.url, authConnector.notion.accessToken);
            return createMessageContent(link, linkText, 'notionBlock', blockContent);
        } else {
            return createMessageContent(link, linkText, 'notionPage');
        }
    }
    return createMessageContent(link, linkText);
}