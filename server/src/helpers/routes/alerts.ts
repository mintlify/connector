import { CodeType } from '../../models/Code';
import { FileInfo } from '../github/patch';
import Doc, { DocType } from '../../models/Doc';
import { Alert, LineRange } from '../github/types';
import { getChangesInRange, getLineRange } from './links';

const getLineRangeFromCode = (code: CodeType, file: FileInfo): LineRange => {
    if (code?.line == null) {
        return getLineRange(file.content, file.content);
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

export const codeToAlert = async (code: CodeType, file: FileInfo): Promise<Alert|null> => {
    const doc: DocType | null = await Doc.findByIdAndUpdate(code.doc, { blocker: true });
    if (doc == null) return null;
    const lineRange = getLineRangeFromCode(code, file);
    const message = `Does [${doc.title || 'this document'}](${doc.url}) need to be updated?`
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
    const lineRange = getLineRangeFromCode(code, file);
    if (lineRange == null) return false;
    const changesInRange = getChangesInRange(file.changes, lineRange);
    return changesInRange.length > 0;
}