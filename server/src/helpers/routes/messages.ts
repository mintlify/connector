import { urlify } from './links';
import { Link } from '../github/types';
import { getDataFromWebpage } from '../../services/webscraper';

export const createMessageContent = async (link: Link, linkText: string): Promise<string> => {
    const url = urlify(link.url);
    return `Does [${linkText}](${url}) need to be updated?`;
}

export const createMessage = async (link: Link, orgId: string): Promise<string> => {
    const { title } = await getDataFromWebpage(link.url, orgId);
    return createMessageContent(link, title);
}