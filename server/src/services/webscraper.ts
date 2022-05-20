import * as cheerio from 'cheerio';
import { getNotionContent, isNotionUrl } from './notion';
import validUrl from 'valid-url';
import Org from '../models/Org';
import { getContentFromHTML } from '../helpers/routes/domparsing';
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
    content: string;
    favicon?: string;
}

export const getDataFromWebpage = async (url: string, orgId: string): Promise<ContentData> => {
    if (!url) {
        throw 'URL not provided'
    }
    if (!validUrl.isUri(url)) {
        throw 'Is not valid URL';
    }

    let scrapingMethod: ScrapingMethod = getScrapingMethod(url);
    const org = await Org.findById(orgId);
    if (scrapingMethod === 'notion-private' && org?.integrations?.notion) {
        const notionAccessToken = org.integrations.notion.accessToken;
        const notionContent = await getNotionContent(url, notionAccessToken);
        return {
            method: 'notion-private',
            title: 'title', // to fix
            content: notionContent
        }
    }

    const response = await client.get(url, {
        render_js: 1,
        proxy_type: 'datacenter',
        session: 1,
        timeout: 10000,
        wait_until: 'domcontentloaded',
        wait_for: 5000,
    });
    
    if (!response.success) {
        throw 'Error fetching results';
    }

    const rawContent = response.response.data;
    const $ = cheerio.load(rawContent);
    // Only switch scraping method if other from url
    scrapingMethod = scrapingMethod === 'other' ? possiblyGetWebScrapingMethod($) : scrapingMethod;

    const title = $('title').text().trim();
    let favicon = $('link[rel="shortcut icon"]').attr('href');
    if (favicon?.startsWith('/')) {
        const urlParsed = new URL(url);
        favicon = `${urlParsed.origin}${favicon}`;
    }
    // Remove unneeded for content
    $('iframe').remove();
    $('script').remove();
    $('style').remove();
    
    let content; 

    if (scrapingMethod === 'readme') {
        // Remove unneeded components
        $('#updated-at').nextAll().remove();
        $('#updated-at').remove();
        $('nav').remove();
        $('header.rm-Header').remove();
        $('.PageThumbs').remove();
        content = getContentFromHTML($('body'));
    }

    if (scrapingMethod === 'stoplight') {
        content = getContentFromHTML($('.Editor'))
    }

    if (scrapingMethod === 'docusaurus') {
        content = getContentFromHTML($('.markdown'))
    }

    if (scrapingMethod === 'github') {
        content = getContentFromHTML($('#readme'))
    }

    if (scrapingMethod === 'notion-public') {
        content = getContentFromHTML($('.notion-page-content'))
    }

    if (scrapingMethod === 'confluence-public') {
        $('.recently-updated').remove();
        content = getContentFromHTML($('#content-body'))
    }

    if (scrapingMethod === 'googledocs') {
        content = getContentFromHTML($('#contents'))
    }

    else {
        content = getContentFromHTML($('body'))
    }

    return {
        method: scrapingMethod,
        title,
        content,
        favicon
    };
}