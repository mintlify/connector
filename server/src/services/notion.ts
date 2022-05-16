import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { Link } from '../helpers/github/types';
import { urlify } from '../helpers/routes/links';

dotenv.config();


export const isNotionUrl = (url: URL): boolean => url.host === 'www.notion.so' || url.host === 'notion.so'

export const getPageId = (url: URL): string => {
    const { pathname } = url;
    const index = pathname.lastIndexOf('-') + 1;
    const pageId = pathname.slice(index);
    return pageId;
};

export const isBlock = (url: URL): boolean => url.hash !== '';

export const getBlockId = (url: URL): string => {
    const { hash } = url;
    return hash.slice(1);
}

export const getNotionPageTitle = async (link: Link, notionAccessToken: string): Promise<string> => {
    try {
        const url = new URL(urlify(link.url));
        const notion = new Client({ auth: notionAccessToken });
        const pageId = getPageId(url);
        const response: any = await notion.pages.retrieve({ page_id: pageId });
        let title = response.properties.title.title[0].text.content;
        if (response.icon.type === 'emoji') {
            title = `${response.icon.emoji} ${title}`
        }
        return title ?? '';
    }
    catch (err) {
        return ''
    }
}

export const getNotionBlockContent = async (url: string, notionAccessToken: string): Promise<string> => {
    try {
        const urlParsed = new URL(urlify(url));
        const notion = new Client({ auth: notionAccessToken });
        const blockId = getBlockId(urlParsed);
        const response: any = await notion.blocks.retrieve({
            block_id: blockId,
        });
        const type = response?.type;
        return response[type].rich_text[0].text.content ?? response[type].url ?? response[type].external.url ?? '';
        
    }
    catch (err) {
        return ''
    }
}

export const getNotionContent = async (url: string, notionAccessToken: string): Promise<string> => {
    try {
        const urlParsed = new URL(urlify(url));
        const notion = new Client({ auth: notionAccessToken });
        if (isBlock(urlParsed)) {
            const blockId = getBlockId(urlParsed);
            const response: any = await notion.blocks.retrieve({
                block_id: blockId,
            });
            const type = response?.type;
            return response[type].rich_text[0].text.content ?? response[type].url ?? response[type].external.url ?? '';
        } else { // page
            const pageId = getPageId(urlParsed);
            const response: any = await notion.pages.retrieve({ page_id: pageId });
            let title = response.properties.title.title[0].text.content;
            if (response.icon.type === 'emoji') {
                title = `${response.icon.emoji} ${title}`
            }
            return title ?? '';
        }
    }
    catch (err) {
        return ''
    }
}
