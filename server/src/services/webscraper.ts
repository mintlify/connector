import * as cheerio from 'cheerio';
import { AuthConnectorType } from '../models/AuthConnector';
import { getNotionContent, isNotionUrl } from './notion';
import validUrl from 'valid-url';
const webScrapingApiClient = require('webscrapingapi');

const client = new webScrapingApiClient(process.env.WEBSCRAPER_KEY);

type URLScrapingMethod = 'notion-private' | 'googledocs' | 'other';
type WebScrapingMethod = 'readme' | 'stoplight' | 'notion-public' | 'confluence-public' | 'web';

type ScrapingMethod = URLScrapingMethod | WebScrapingMethod;

const getScrapingMethod = (url: string): URLScrapingMethod => {
    const urlParsed = new URL(url);
    if (isNotionUrl(urlParsed)) {
        return 'notion-private';
    }
    if (urlParsed.host === 'docs.google.com' && url.includes('/pub')) {
        return 'googledocs';
    }
    return 'other';
}

const possiblyGetWebScrapingMethod = ($: cheerio.CheerioAPI): WebScrapingMethod => {
    const readmeVersion = $('meta[name="readme-version"]');
    if (readmeVersion.length !== 0) {
        return 'readme';
    }
    const stoplightConnect = $('link[href="https://js.stoplight.io"]');
    if (stoplightConnect.length !== 0) {
        return 'stoplight';
    }
    const notionApp = $('#notion-app');
    if (notionApp.length !== 0) {
        return 'notion-public';
    }
    const confluenceId = $('#com-atlassian-confluence');
    if (confluenceId.length !== 0) {
        return 'confluence-public';
    }
    return 'web';
}

type ContentData = {
    method: ScrapingMethod;
    content: string;
}

export const getContentFromWebpage = async (url: string, authConnector?: AuthConnectorType): Promise<ContentData> => {
    if (!url) {
        throw 'URL not provided'
    }
    if (!validUrl.isUri(url)) {
        throw 'Is not valid URL';
    }

    let scrapingMethod: ScrapingMethod = getScrapingMethod(url);
    const notionAccessToken = authConnector?.notion.accessToken;
    if (scrapingMethod === 'notion-private' && notionAccessToken) {
        const notionContent = await getNotionContent(url, notionAccessToken);
        return {
            method: 'notion-private',
            content: notionContent
        }
    }

    const response = await client.get(url, {
        render_js: 1,
        proxy_type: 'datacenter',
        country: 'us',
        session: 1,
        timeout: 10000,
        wait_until: 'domcontentloaded',
        wait_for: 2000,
    });
    
    if (!response.success) {
        throw 'Error fetching results';
    }

    const rawContent = response.response.data;
    const $ = cheerio.load(rawContent);
    // Only switch scraping method if other from url
    scrapingMethod = scrapingMethod === 'other' ? possiblyGetWebScrapingMethod($) : scrapingMethod;

    let content = $('body').text().trim();

    if (scrapingMethod === 'readme') {
        // Remove date
        $('.DateLine').remove();
        content = $('body').text().trim();
    }

    if (scrapingMethod === 'stoplight') {
        content = $('.Editor').text().trim();
    }

    if (scrapingMethod === 'notion-public') {
        content = $('.notion-app-inner').text().trim();
    }

    if (scrapingMethod === 'confluence-public') {
        $('.recently-updated').remove();
        content = $('#content-body').text().trim();
    }

    if (scrapingMethod === 'googledocs') {
        content = $('#contents').text().trim();
    }

    return {
        method: scrapingMethod,
        content
    };
}