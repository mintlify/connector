import { FileSkeleton, Skeleton } from 'parsing/types';
import { GitbookFile } from '.';

import path from 'path';
import { marked } from 'marked';

/* ----------------- SKELETON TO MARKDOWN ----------------- */

const formatTopComment = (topComment: string): string => {
    return `---
description: >-
${topComment}
---\n\n`
}

const formatTitle = (title: string): string => {
    return `# ${title}\n\n`
};
const formatSkeletonToMarkdown = (skeleton: Skeleton): string => {
    return `### [${skeleton.signature}](${skeleton.url})\n\n${skeleton.doc}`;
}

export const fileSkeletonToMarkdown = (fileSkeleton: FileSkeleton): string => {
    const { topComment, skeletons } = fileSkeleton;
    const description = formatTopComment(topComment);
    const title = formatTitle(fileSkeleton.filename);
    const formattedSkeletons = skeletons.map((skeleton) => formatSkeletonToMarkdown(skeleton)).join('\n\n');
    return `${description}${title}${formattedSkeletons}`;
}

export const fileSkeletonToMarkdownFile = (fileSkeleton: FileSkeleton): GitbookFile => {
    const mdFilename = `mintlify/${fileSkeleton.filename}.md`;
    return {
        filename: mdFilename,
        content: fileSkeletonToMarkdown(fileSkeleton)
    };
}

const formatFileSkeletonForSummary = (file: GitbookFile): string => {
    const filename = path.parse(file.filename).base.slice(0,-3);
    return `* [${filename}](${file.filename})`;
}

// TODO: Create Hierarchy
export const summaryUpdateOnInstallation = (summary: GitbookFile, files: GitbookFile[]): GitbookFile => {
    const existingContent = summary.content ?? '';
    const header = '## Mintlify Docs <a href="#mintlify" id="mintlify"></a>\n\n';
    const table = files.map((file) => formatFileSkeletonForSummary(file)).join('\n');
    let content = existingContent;
    if (existingContent.includes(header)) {
        content = `${existingContent}\n${table}`;
    } else {
        content = `${existingContent}\n\n${header}${table}`;
    }
    return {
        filename: summary?.filename ?? 'SUMMARY.md',
        content
    };
}

/* ----------------- MARKDOWN TO SKELETON ----------------- */
const isSignature = (node: any): boolean => {
    return (node.type === 'heading'
        && node.depth === 4
        && node.tokens[0].type === 'link')
};

const mdToSkeletons = (tree: any[]): Skeleton[] => {
    const skeletons: Skeleton[] = [];
    tree.map((node, i) => {
        const nextNode = tree[i+1];
        if (isSignature(node) && nextNode.type === 'paragraph') {
            const signature = node.tokens[0].text;
            const url = node.tokens[0].href;
            const doc = nextNode.text;
            const skeleton: Skeleton = {
                signature,
                url,
                doc
            }
            skeletons.push(skeleton);
        }
    })
    return skeletons;
};

export const mdToFileSkeleton = (file: GitbookFile): FileSkeleton => {
    if (file === null) return;
    const tokens: any = marked.lexer(file.content);
    const skeletons: Skeleton[] = mdToSkeletons(tokens);
    console.log({tokens});
    const topComment = tokens[1]?.text.slice(13);
    return {
        skeletons,
        topComment,
        filename: file.filename
    };
}

