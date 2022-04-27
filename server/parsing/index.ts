import { FileSkeleton, Program } from './types';
import getPL from 'parsing/languages';
import parser from '@mintlify/grove';

export const getTreeSitterProgram = (code: string, languageId: string): Program => {
  const parsed = parser(code, languageId);
  return parsed;
}

export const wrapWithPHPTags = (code: string) => {
  return '<?php \n' + code + '?>';
}

export const formatCode = (languageId: string, code: string): string => {
  let formattedCode = code;
  if (languageId === 'php' && formattedCode.substring(0,5) !== '<?php') {
    formattedCode = wrapWithPHPTags(formattedCode);
  }

  return formattedCode;
}

export const getFileSkeleton = (file: string, languageId: string): FileSkeleton => {
  try {
    const formattedFile = formatCode(languageId, file);
    const fileTree = getTreeSitterProgram(formattedFile, languageId);
    const desiredPL = getPL(languageId);
    const fileSkeleton = desiredPL.getFileSkeleton(fileTree.root)
    return fileSkeleton;
  } catch {
    return null;
  }
}