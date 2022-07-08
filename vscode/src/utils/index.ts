import { Disposable, Event, TextEditor, Range } from 'vscode';

export { isEqual as areEqual } from 'lodash-es';

export const getHighlightedText = (editor: TextEditor) => {
  const { selection } = editor;
  const highlightRange = new Range(editor.selection.start, editor.selection.end);
  const highlighted = editor.document.getText(highlightRange);
  return { selection, highlighted };
};

export function once<T>(event: Event<T>): Event<T> {
  return (listener: (e: T) => unknown, thisArgs?: unknown, disposables?: Disposable[]) => {
    const result = event(
      e => {
        result.dispose();
        return listener.call(thisArgs, e);
      },
      null,
      disposables,
    );

    return result;
  };
}