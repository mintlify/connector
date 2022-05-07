import * as cheerio from 'cheerio';
import { AuthConnectorType } from '../models/AuthConnector';
import { getNotionContent, isNotionUrl } from './notion';
import validUrl from 'valid-url';
import axios from 'axios';
const webScrapingApiClient = require('webscrapingapi');

const client = new webScrapingApiClient(process.env.WEBSCRAPER_KEY);

type URLScrapingMethod = 'notion-private' | 'googledocs' | 'other';
type WebScrapingMethod = 'readme' | 'stoplight' | 'docusaurus' | 'github' | 'notion-public' | 'confluence-public' | 'web';

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
    const githubContent = $('meta[content="GitHub"]');
    const hasReadmeId = $('#readme');
    if (githubContent.length !== 0 && hasReadmeId.length !== 0) {
        return 'github';
    }
    const notionApp = $('#notion-app');
    if (notionApp.length !== 0) {
        return 'notion-public';
    }
    const confluenceId = $('#com-atlassian-confluence');
    if (confluenceId.length !== 0) {
        return 'confluence-public';
    }
    const docusaurusVersion = $('meta[name="docusaurus_version"]');
    if (docusaurusVersion.length !== 0) {
        return 'docusaurus';
    }
    return 'web';
}

type ContentData = {
    method: ScrapingMethod;
    title: string;
    favicon: string;
    content: string;
}

export const getDataFromWebpage = async (url: string, authConnector?: AuthConnectorType): Promise<ContentData> => {
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
            title: 'title', // to fix
            favicon: 'https://www.notion.so/images/favicon.ico',
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

    const title = $('title').text().trim();
    const faviconRes: any = await axios.get(`https://s2.googleusercontent.com/s2/favicons?domain_url=${url}`);
    const favicon = faviconRes?.request?.res?.responseUrl;
    let content = $('body').text().trim();

    if (scrapingMethod === 'readme') {
        // Remove date
        $('.DateLine').remove();
        content = $('body').text().trim();
    }

    if (scrapingMethod === 'stoplight') {
        content = $('.Editor').text().trim();
    }

    if (scrapingMethod === 'docusaurus') {
        content = $('.markdown').text().trim();
    }

    if (scrapingMethod === 'github') {
        content = $('#readme').text().trim();
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
        title,
        favicon,
        content
    };
}