const webScrapingApiClient = require('webscrapingapi');
import * as cheerio from 'cheerio';
import { AuthConnectorType } from '../models/AuthConnector';
import { getNotionContent, isNotionUrl } from './notion';

const client = new webScrapingApiClient(process.env.WEBSCRAPER_KEY);

type ScrapingMethod = 'notion' | 'web';

const getScrapingMethod = (url: string): ScrapingMethod => {
    const urlParsed = new URL(url);
    if (isNotionUrl(urlParsed)) {
        return 'notion';
    }
    return 'web';
}

export const getContentFromWebpage = async (url: string, authConnector?: AuthConnectorType): Promise<string> => {
    const scrapingMethod = getScrapingMethod(url);
    const notionAccessToken = authConnector?.notion.accessToken;
    if (scrapingMethod === 'notion' && notionAccessToken) {
        return getNotionContent(url, notionAccessToken)
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
    
    if (response.success) {
        const content = response.response.data;
        const $ = cheerio.load(content);
        const text = $('body').text().trim();

        return text;
    } else {
        return '';
    }
}