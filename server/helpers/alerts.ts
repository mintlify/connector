import axios from 'axios';
import { urlify } from './links';
import { isNotionUrl, isBlock, getNotionBlockContent, getNotionPageTitle } from 'services/notion';
import { getLanguageIdByFilename } from 'parsing/filenames';
import getPL from 'parsing/languages';
import { formatCode, getTreeSitterProgram } from 'parsing';
import { ConnectFile, Alert, Link } from './types';
import { getLinksInFile } from './links';
import { AuthConnectorType } from 'models/AuthConnector';

export const getAlertsForFile = async (file: ConnectFile, authConnector?: AuthConnectorType): Promise<Alert[]> => {
    const languageId = getLanguageIdByFilename(file.filename);
    const content = formatCode(languageId, file.content);
    const pl = getPL(languageId);
    const tree = getTreeSitterProgram(content, languageId);
    const links: Link[] = getLinksInFile(tree.root, file.changes, pl);
    const alertPromises: Promise<Alert>[] = links.map(async (link) => await linkToAlert(link, file.filename, authConnector));
    const alertResults = await Promise.all(alertPromises) as Alert[];
    return alertResults;
}

export const getAlertsForAllFiles = async (files: ConnectFile[], authConnector?: AuthConnectorType): Promise<Alert[]> => {
    const alertPromises = files
        .filter((file) => file != null)
        .map(async (file) => {
            return new Promise((resolve) => {
                getAlertsForFile(file, authConnector)
                    .then((alertsForFile) => {
                        resolve(alertsForFile);
                    })
                    .catch(() => {
                        resolve(null);
                    })
            })
        });
    const alertsResults = await Promise.all(alertPromises) as Alert[][];
    const alerts = alertsResults.filter((result) => result != null).reduce((acc: Alert[], alerts: Alert[]) => {
        acc = acc.concat(alerts)
        return acc;
    }, []);

    return alerts;
}

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

const getDocumentTitle = async (link: Link, authConnector?: AuthConnectorType): Promise<string> => {
    const url = new URL(urlify(link.url));
    if (isNotionUrl(url) && authConnector?.notion) {
        const pageTitle = await getNotionPageTitle(link, authConnector.notion.accessToken);
        return pageTitle;
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
            const blockContent = await getNotionBlockContent(link, authConnector.notion.accessToken);
            return createMessageContent(link, linkText, 'notionBlock', blockContent);
        } else {
            return createMessageContent(link, linkText, 'notionPage');
        }
    }
    return createMessageContent(link, linkText);
}

export const linkToAlert = async (link: Link, filename: string, authConnector?: AuthConnectorType): Promise<Alert> => {
    let message = '';
    if (link.type !== 'new') {
        message = await createMessage(link, authConnector);
    }
    return {
        ...link,
        message,
        filename
    }
};

export const createNewLinksMessage = async (alerts: Alert[], authConnector?: AuthConnectorType): Promise<string> => {
    const documentTitlePromises: Promise<string>[] = alerts.map((link) => getDocumentTitle(link, authConnector) )
    const documentTitles: string[] = await Promise.all(documentTitlePromises);
    const urlsFormatted = documentTitles.map((title, i) => {
        if (title === 'this document') {
            return `* [${alerts[i].url}](${alerts[i].url})`;
        }
        return `* [${title}](${alerts[i].url})`;
    }).join('\n');
    return `New link(s) have been detected:\n\n${urlsFormatted}`;
}
