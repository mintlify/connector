import { PLConnect, TreeNode } from 'parsing/types';
import { Change, Link, LineRange } from 'helpers/types';

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

const commentIsUrl = (node: TreeNode, pl: PLConnect): boolean => {
    const content = pl.extractComment(node);
    if (content == null) {
        return false;
    }
    return checkIfUrl(content);
}

const getChangesInRange = (changes: Change[], lineRange: LineRange): Change[] => {
    return changes.filter((change) => change.line >= lineRange.start && change.line <= lineRange.end)
}

const getLineRange = (content: string, substring: string): LineRange => {
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

const didChange = (commentNode: TreeNode, file: string, changes: Change[], nodeRange: LineRange): boolean => {
    const lineRangeOfComment = getLineRange(file, commentNode.value);
    const changesInComment = getChangesInRange(changes, lineRangeOfComment);
    const changesInRange = getChangesInRange(changes, nodeRange);
    if (changesInComment.length > 0) { // Don't detect change if link was just added!
        return false;
    }
    if (changesInRange.length > 0) {
        return true;
    }
    return false;
}

const isNewLink = (commentNode: TreeNode, file: string, changes: Change[]): boolean => {
    const lineRangeOfComment = getLineRange(file, commentNode.value);
    const changesInComment = getChangesInRange(changes, lineRangeOfComment);
    if (changesInComment.length > 0) {
        return true;
    }
    return false;
}

const getLinkFromNode = (parent: TreeNode, node: TreeNode, ithChild: number, changes: Change[], file: string, pl: PLConnect): Link | null => {
    if (commentIsUrl(node, pl)) {
        if (parent.children[ithChild+1] == null) {
            return null;
        }
        const url = pl.extractComment(node);
        let totalRange: LineRange;
        let type = 'lines';
        if (ithChild === 0) {
            const fileRange = getLineRange(file, parent.value);
            totalRange = fileRange
            if (parent.value === file) {
                type = 'file';
            }
        } else {
            totalRange = getLineRange(file, parent.children[ithChild+1].value);
        }
        if (didChange(node, file, changes, totalRange)) {
            const link: Link = { url, lineRange: totalRange, type };
            return link;
        }
        if (isNewLink(node, file, changes)){
            type = 'new';
            const link: Link = { url, lineRange: totalRange, type };
            return link;
        }
    }
    return null;
} 

const getLinks = (root: TreeNode, changes: Change[], file: string, pl: PLConnect): Link[] => {
    if (root.children == null) { return []; }
    const childNodes = root.children;

    let links: Link[] = [];
    childNodes.forEach((node, i) => {
        const link = getLinkFromNode(root, node, i, changes, file, pl);    
        if (link != null) {
            links.push(link);
        }
        if (node.children != null) {
            const childLinks = getLinks(node, changes, file, pl);
            links = links.concat(childLinks);
        }
    });
    return links;
}

export const getLinksInFile = (root: TreeNode, changes: Change[], pl: PLConnect): Link[] => {
    return getLinks(root, changes, root.value, pl);
}