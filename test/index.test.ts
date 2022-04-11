import { parsePatch } from '../src/patch';

describe('Patch to changes', () => {
  test('Simple patch', () => {
    const patch = `@@ -1,5 +1,6 @@
#include <stdio.h>

-int main() {
+int main(int argc, char *argv[]) {
  printf("Hello World\n");
+	return 0;
}`;

    const changes = parsePatch(patch);
    expect(changes).toStrictEqual([
      {
        type: 'delete',
        line: 3,
        content: 'int main() {'
      },
      {
        type: 'add',
        line: 3,
        content: 'int main(int argc, char *argv[]) {'
      },
      {
        type: 'add',
        line: 6,
        content: '	return 0;'
      }
    ])
  });

  test('Patch', () => {
    const patch = `@@ -15,8 +15,9 @@ export const getAlertsForFile = async (file: ConnectFile): Promise<Alert[]> => {
  const pl = getPL(languageId);
  const tree = await getTreeSitterProgram(content, languageId);
  const links: Link[] = getLinksInFile(tree.root, file.changes, pl);
- const alertsForFile: Alert[] = links.map((link) => linkToAlert(link, file.filename));
- return alertsForFile;
+ const alertPromises: Promise<Alert>[] = links.map(async (link) => await linkToAlert(link, file.filename));
+ const alertResults = await Promise.all(alertPromises) as Alert[];
+ return alertResults;
}

export const getAlertsForAllFiles = async (files: ConnectFile[]): Promise<Alert[]> => {`;

  const changes = parsePatch(patch);
  expect(changes).toStrictEqual([
    {
      type: 'delete',
      line: 18,
      content: ' const alertsForFile: Alert[] = links.map((link) => linkToAlert(link, file.filename));'
    },
    {
      type: 'delete',
      line: 19,
      content: ' return alertsForFile;'
    },
    {
      type: 'add',
      line: 18,
      content: ' const alertPromises: Promise<Alert>[] = links.map(async (link) => await linkToAlert(link, file.filename));'
    },
    {
      type: 'add',
      line: 19,
      content: ' const alertResults = await Promise.all(alertPromises) as Alert[];'
    },
    {
      type: 'add',
      line: 20,
      content: ' return alertResults;'
    }
  ])
  });

  test('No content', () => {
    const patch = undefined;
    const changes = parsePatch(patch);
    expect(changes).toStrictEqual([]);
  })
});