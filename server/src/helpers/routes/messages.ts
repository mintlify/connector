import { urlify } from './links';
import { Link } from '../github/types';
import { getDataFromWebpage } from '../../services/webscraper';

export const createMessageContent = async (link: Link, linkText: string, content?: string): Promise<string> => {
    const url = urlify(link.url);
    const contentMessage = content ? `\n> ${content}` : '';
    return `Does [${linkText}](${url}) need to be updated?${contentMessage}`;
}

export const createMessage = async (link: Link, orgId: string): Promise<string> => {
    const {title, content} = await getDataFromWebpage(link.url, orgId);
    return createMessageContent(link, title, content);
}