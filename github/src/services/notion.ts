import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import axios from 'axios';
import { Link } from '../helpers/routes/types';
import { urlify } from '../helpers/routes/links';
import { ENDPOINT } from '../helpers/routes/octokit';

dotenv.config();

const clientId = 'ec770c41-07f8-44bd-a4d8-66d30e9786c8';
const redirectUrl = `${ENDPOINT}/routes/notion/authorization`;

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

export const getNotionURL = (state?: string) => {
    const url = new URL('https://api.notion.com/v1/oauth/authorize');
    url.searchParams.append('owner', 'user');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUrl);
    url.searchParams.append('response_type', 'code');
    if (state) {
        url.searchParams.append('state', state);
    }
    return url.toString();
}

type NotionAuthResponse = {
    access_token: string,
    bot_id: string,
    workspace_name: string,
    workspace_icon: string,
    workspace_id: string,
}

type NotionAuthData = {
    response?: NotionAuthResponse,
    error?: string
}

export const getNotionAccessTokenFromCode = async (code: string): Promise<NotionAuthData> => {
    const token = `${clientId}:${process.env.NOTION_OAUTH_SECRET}`;
    const encodedToken = Buffer.from(token, 'utf8').toString('base64');

    try {
        const { data }: { data: NotionAuthResponse } = await axios.post('https://api.notion.com/v1/oauth/token',
            { grant_type: 'authorization_code', code, redirect_uri: redirectUrl },
            { headers: { 'Authorization': `Basic ${encodedToken}` } }
        );
        return { response: data }
    }

    catch (error: any) {
        return { error }
    }
}