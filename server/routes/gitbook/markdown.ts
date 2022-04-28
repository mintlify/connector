import { FileSkeleton, Skeleton } from 'parsing/types';

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

export const fileSkeletonToMarkdown = (fileSkeleton: FileSkeleton, filename: string): string => {
    const { topComment, skeletons } = fileSkeleton;
    const description = formatTopComment(topComment);
    const title = formatTitle(filename);
    const formattedSkeletons = skeletons.map((skeleton) => formatSkeletonToMarkdown(skeleton)).join('\n\n');
    return `${description}${title}${formattedSkeletons}`;
}