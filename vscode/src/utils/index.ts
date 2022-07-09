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

export function any<T>(...promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const errors: Error[] = [];
    let settled = false;

    for (const promise of promises) {
      // eslint-disable-next-line no-loop-func
      void (async () => {
        try {
          const result = await promise;
          if (settled) return;

          resolve(result);
          settled = true;
        } catch (ex) {
          errors.push(ex);
        } finally {
          if (!settled) {
            if (promises.length - errors.length < 1) {
              reject(new AggregateError(errors));
              settled = true;
            }
          }
        }
      })();
    }
  });
}