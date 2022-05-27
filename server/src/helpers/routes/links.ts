import { Change, LineRange } from '../github/types';

export const urlify = (str: string): string => {
    let content = str;
    if (!/^https?:\/\//i.test(str)) {
        content = 'http://' + str;
    }
    return content;
}

export const checkIfUrl = (commentContent: string): boolean => {
    return /(([a-z]+:\/\/)?(([a-z0-9-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-.~]+)*(\/([a-z0-9_\-.]*)(\?[a-z0-9+_\-.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi.test(commentContent.trim());
}

export const getChangesInRange = (changes: Change[], lineRange: LineRange): Change[] => {
    return changes.filter((change) => change.line >= lineRange.start && change.line <= lineRange.end)
}

export const getLineRange = (content: string, substring: string): LineRange => {
    const indexOfSubstring = content.indexOf(substring);
    const upToindex = content.substring(0, indexOfSubstring);
    const startLine = upToindex.split('\n').length;
    const linesOfSubstring = substring.split('\n').length;
    const endLine = startLine + linesOfSubstring - 1;
    return {
      start: startLine,
      end: endLine
    };
}