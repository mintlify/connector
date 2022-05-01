import { Program } from './types';
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