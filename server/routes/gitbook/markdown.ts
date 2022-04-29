import { FileSkeleton, Skeleton } from 'parsing/types';
import { GitbookFile } from '.';
import path from 'path';

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

const formatFileSkeletonForSummary = (file: GitbookFile): string => {
    const filename = path.parse(file.filename).base.slice(0,-3);
    return `* [${filename}](${file.filename})`;
}

// TODO: Create Hierarchy
export const summaryUpdateOnInstallation = (summary: GitbookFile, files: GitbookFile[]): GitbookFile => {
    const header = '## Mintlify Docs <a href="#mintlify" id="mintlify"></a>\n\n';
    const table = files.map((file) => formatFileSkeletonForSummary(file)).join('\n');
    const content = `${summary.content}\n\n${header}${table}`;
    return {
        filename: summary.filename,
        content
    };
}
