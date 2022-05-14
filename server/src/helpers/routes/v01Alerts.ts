
import { getLanguageIdByFilename } from '../../parsing/filenames';
import getPL from '../../parsing/languages';
import { formatCode, getTreeSitterProgram } from '../../parsing';
import { Alert, Link } from '../github/types';
import { getLinksInFile } from './links';
import { FileInfo } from '../github/patch';
import { createMessage, getDocumentTitle } from './messages';


export const getAlertsForFile = async (file: FileInfo): Promise<Alert[]> => {
    const languageId = getLanguageIdByFilename(file.filename);
    const content = formatCode(languageId, file.content);
    const pl = getPL(languageId);
    const tree = getTreeSitterProgram(content, languageId);
    const links: Link[] = getLinksInFile(tree.root, file.changes, pl);
    const alertPromises: Promise<Alert>[] = links.map(async (link) => await linkToAlert(link, file.filename));
    const alertResults = await Promise.all(alertPromises) as Alert[];
    return alertResults;
}

export const getAlertsForAllFiles = async (files: FileInfo[]): Promise<Alert[]> => {
    const alertPromises = files
        .filter((file) => file != null)
        .map(async (file) => {
            return new Promise((resolve) => {
                getAlertsForFile(file)
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


export const linkToAlert = async (link: Link, filename: string): Promise<Alert> => {
    let message = '';
    if (link.type !== 'new') {
        message = await createMessage(link);
    }
    return {
        ...link,
        message,
        filename
    }
};

export const createNewLinksMessage = async (alerts: Alert[]): Promise<string> => {
    const documentTitlePromises: Promise<string>[] = alerts.map((link) => getDocumentTitle(link))
    const documentTitles: string[] = await Promise.all(documentTitlePromises);
    const urlsFormatted = documentTitles.map((title, i) => {
        if (title === 'this document') {
            return `* [${alerts[i].url}](${alerts[i].url})`;
        }
        return `* [${title}](${alerts[i].url})`;
    }).join('\n');
    return `New link(s) have been detected:\n\n${urlsFormatted}`;
}
