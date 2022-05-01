const wrapAround = (code: string, start: string, end: string, newLine = true): string => {
  if (newLine) {
    return `${start}\n${code}\n${end}`;
  }

  return `${start} ${code} ${end}`;
};

const singleLine = (code: string, comment: string): string => {
  return code.split('\n').map((line) => `${comment} ${line}`).join('\n');
};

export const addComments = (code: string, languageId: string, commentFormat?: string): string => {
  const newLines = commentFormat !== 'line' ? true : false;

  switch (languageId) {
  case 'html':
    return wrapAround(code, '<!--', '-->', newLines);
  case 'c':
  case 'cpp':
  case 'csharp':
  case 'rust':
  case 'css':
  case 'scss':
  case 'php':
  case 'kotlin':
  case 'javascript':
  case 'javascriptreact':
  case 'typescript':
  case 'typescriptreact':
    return wrapAround(code, '/*', '*/', newLines);
  case 'haskell':
    return wrapAround(code, '{-', '-}', newLines);
  case 'ruby':
  case 'python':
  case 'r':
  case 'perl':
    return singleLine(code, '#');
  case 'erl':
  case 'hrl':
    return singleLine(code, '%');
  case 'go':
  case 'java':
    return singleLine(code, '//');
  case 'clojure':
    return singleLine(code, ';;');
  case 'dart':
    return singleLine(code, '///');
  default:
    return singleLine(code, '//');
  }
};

export const wrapStr = (str: string, width: number | null) => {
  if (width == null) return str;
  
  return str.replace(
    new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'), '$1\n'
  );
}