import * as vscode from 'vscode';

  export const getHighlightedText = (editor: vscode.TextEditor) => {
    const { selection } = editor;
    const highlightRange = new vscode.Range(editor.selection.start, editor.selection.end);
    const highlighted = editor.document.getText(highlightRange);
    return { selection, highlighted };
  };