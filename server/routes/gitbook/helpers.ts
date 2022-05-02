import { GitbookFile, FilePair } from '.';
import { FileSkeleton, Skeleton } from 'parsing/types';
import { AuthConnectorType } from 'models/AuthConnector';
import { getLanguageIdByFilename } from 'parsing/filenames';
import getPL from 'parsing/languages';
import { formatCode, getFileSkeleton } from 'parsing';
import { addUrlsToSkeletons } from './url';
import { fileSkeletonToMarkdown, summaryUpdateOnInstallation } from './markdown';

const SUPPORTED_LANGUAGES = ['typescript'];

export const fileToFileSkeleton = (file: GitbookFile, repo?: string, branch?: string, authConnector?: AuthConnectorType): FileSkeleton => {
    const languageId = getLanguageIdByFilename(file.filename);
    if (!SUPPORTED_LANGUAGES.includes(languageId)) return;
    const content = formatCode(languageId, file.content);
    const fileSkeleton = getFileSkeleton(content, languageId);
    if (repo && branch && authConnector) {
        fileSkeleton.skeletons = addUrlsToSkeletons(fileSkeleton.skeletons, repo, branch, file.filename, authConnector);
    }
    fileSkeleton.skeletons = fileSkeleton.skeletons.map((skeleton) => { return { ...skeleton, filename: file.filename };});
    return fileSkeleton;
};

export const fileToMdFile = (file: GitbookFile, repo?: string, branch?: string, authConnector?: AuthConnectorType): GitbookFile => {
    const fileSkeleton = fileToFileSkeleton(file, repo, branch, authConnector);
    const markdown = fileSkeletonToMarkdown(fileSkeleton);
    const mdFilename = `mintlify/${fileSkeleton.filename}.md`
    return { filename: mdFilename, content: markdown };
};

export const filesToMdFiles = (files: GitbookFile[], repo?: string, branch?: string, authConnector?: AuthConnectorType, summary?: GitbookFile): GitbookFile[] => {
    const mdFiles: GitbookFile[] = [];
    files.forEach(async (file) => {
        const mdFile = fileToMdFile(file, repo, branch, authConnector)
        mdFiles.push(mdFile);
    });
    mdFiles.push(summaryUpdateOnInstallation(summary, mdFiles));
    return mdFiles;
};

export const updateCodeFile = (filePair: FilePair): GitbookFile => {
    const { code } = filePair;
    const mdSkeletons: Skeleton[] = filePair.md.fileSkeleton.skeletons;
    const codeSkeletons: Skeleton[] = filePair.code.fileSkeleton.skeletons;
    let newContent = code.content;
    mdSkeletons.forEach((skeleton) => {
        const matchingSkeleton = codeSkeletons.find((codeSkeleton) => codeSkeleton.signature === skeleton.signature);
        if (matchingSkeleton != null && skeleton.doc !== matchingSkeleton.doc) {
            const languageId = getLanguageIdByFilename(code.filename);
            const desiredPL = getPL(languageId);
            const comment = desiredPL.comment(skeleton.doc);
            newContent = newContent.replace(matchingSkeleton.rawDoc, comment);
        }
    });
    return {
        ...code,
        content: newContent
    };
};

export const updateMdFile = (filePair: FilePair): GitbookFile => {
    const { md } = filePair;
    const mdSkeletons: Skeleton[] = filePair.md.fileSkeleton.skeletons;
    const codeSkeletons: Skeleton[] = filePair.code.fileSkeleton.skeletons;
    let newContent = md.content;
    codeSkeletons.forEach((skeleton) => {
        const skeletonWithSignatureMatch = mdSkeletons.find((mdSkeleton) => mdSkeleton.signature === skeleton.signature);
        if (skeletonWithSignatureMatch != null && skeleton.doc !== skeletonWithSignatureMatch.doc) {
            newContent = newContent.replace(skeletonWithSignatureMatch.doc, skeleton.doc);
        }
        const skeletonWithDocMatch = mdSkeletons.find((mdSkeleton) => mdSkeleton.doc === skeleton.doc);
        if (skeletonWithDocMatch != null && skeleton.signature !== skeletonWithDocMatch.signature) {
            newContent = newContent.replace(skeletonWithDocMatch.signature, skeleton.signature);
        }
    });
    return {
        ...md,
        content: newContent
    };
};