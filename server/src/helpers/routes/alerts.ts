import { CodeType } from '../../models/Code';
import { FileInfo } from '../github/patch';
import Doc, { DocType } from '../../models/Doc';
import { AuthConnectorType } from '../../models/AuthConnector';
import { createMessage } from './messages';
import { Link, Alert, LineRange } from '../github/types';
import { getChangesInRange } from './links';

const getLineRange = (code: CodeType): LineRange|undefined => {
    if (code?.line == null) {
        return undefined;
    } else {
        if (code?.endLine == null) {
            return {
                start: code?.line,
                end: code?.line
            }
        } else {
            return {
                start: code?.line,
                end: code?.endLine
            }
        }
    }
}

export const codeToAlert = async (code: CodeType, file: FileInfo, authConnector?: AuthConnectorType): Promise<Alert|null> => {
    const doc: DocType | null = await Doc.findByIdAndUpdate(code.doc, { blocker: true });
    if (doc == null) return null;
    const lineRange = getLineRange(code);
    const link: Link = {
        url: doc.url,
        type: code.type,
        lineRange,
    };
    const message = await createMessage(link, authConnector);
    return {
        url: doc.url,
        message,
        filename: file.filename,
        type: code.type,
        lineRange,
    }
};

export const didChange = (code: CodeType, file: FileInfo): boolean => {
    if (!file.filename.endsWith(code.file) || !code.file.endsWith(file.filename)) {
        return false;
    }
    const lineRange = getLineRange(code);
    if (lineRange == null) return false;
    const changesInRange = getChangesInRange(file.changes, lineRange);
    return changesInRange.length > 0;
}