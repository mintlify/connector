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

    const { changes, lineRanges } = parsePatch(patch);
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
    ]);
    expect(lineRanges).toStrictEqual([
      {
        minusRange: {
          start: 1,
          end: 5,
        },
        addRange: {
          start: 1,
          end: 6
        }
      }
    ]);
  });

  test('Complex patch', () => {
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

  const { changes, lineRanges } = parsePatch(patch);
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
  ]);
    expect(lineRanges).toStrictEqual([
      {
        minusRange: {
          start: 15,
          end: 22,
        },
        addRange: {
          start: 15,
          end: 23
        }
      }
    ]);
  });

  test('Patch with different start lines', () => {
    const patch = `@@ -109,4 +111,14 @@ export default class Dart implements PL {
getProgress(): Progress {
  return null;
}
+extractComment(tree: TreeNode): string {
+    switch (tree.kind) {
+      case 'documentation_comment':
+        return removeFront(tree.value, 3);
+      case 'comment':
+        return extractBaseComments(tree);
+      default:
+        return null;
+    }
+}
}`;
    const { changes, lineRanges } = parsePatch(patch);
    expect(changes).toStrictEqual([
      {
        type: 'add',
        line: 114,
        content: 'extractComment(tree: TreeNode): string {'
      },
      {
        type: 'add',
        line: 115,
        content: '    switch (tree.kind) {'
      },
      {
        type: 'add',
        line: 116,
        content: '      case \'documentation_comment\':'
      },
      {
        type: 'add',
        line: 117,
        content: '        return removeFront(tree.value, 3);'
      },
      {
        type: 'add',
        line: 118,
        content: '      case \'comment\':'
      },
      {
        type: 'add',
        line: 119,
        content: '        return extractBaseComments(tree);'
      },
      {
        type: 'add',
        line: 120,
        content: '      default:'
      },
      {
        type: 'add',
        line: 121,
        content: '        return null;'
      },
      {
        type: 'add',
        line: 122,
        content: '    }'
      },
      {
        type: 'add',
        line: 123,
        content: '}'
      },
    ]);
    expect(lineRanges).toStrictEqual([
      {
        minusRange: {
          start: 109,
          end: 112,
        },
        addRange: {
          start: 111,
          end: 124
        }
      }
    ]);
  })

  test('Adding new file', () => {
    const patch = `@@ -0,0 +1,3 @@
+import { Client } from '@notionhq/client';
+
+console.log("Hi there")`;
  const { changes, lineRanges } = parsePatch(patch);
  expect(changes).toStrictEqual([
    {
      type: 'add',
      line: 1,
      content: 'import { Client } from \'@notionhq/client\';'
    },
    {
      type: 'add',
      line: 2,
      content: ''
    },
    {
      type: 'add',
      line: 3,
      content: 'console.log("Hi there")'
    }
  ]);
  expect(lineRanges).toStrictEqual([
    {
      minusRange: {
        start: 0,
        end: -1,
      },
      addRange: {
        start: 1,
        end: 3
      }
    }
  ]);
  });

  test('Deleting file', () => {
    const patch = `@@ -1,9 +0,0 @@
-import mongoose, { Schema } from 'mongoose';
-
-const LinkSchema = new Schema({
-  //  To be added
-});
-
-const Link = mongoose.model('Link', LinkSchema, 'links');
-
-export default Link; `;
    const { changes, lineRanges } = parsePatch(patch);
    expect(changes).toStrictEqual([
      {
        type: 'delete',
        line: 1,
        content: 'import mongoose, { Schema } from \'mongoose\';'
      },
      {
        type: 'delete',
        line: 2,
        content: ''
      },
      {
        type: 'delete',
        line: 3,
        content: 'const LinkSchema = new Schema({'
      },
      {
        type: 'delete',
        line: 4,
        content: '  //  To be added'
      },
      {
        type: 'delete',
        line: 5,
        content: '});'
      },
      {
        type: 'delete',
        line: 6,
        content: ''
      },
      {
        type: 'delete',
        line: 7,
        content: 'const Link = mongoose.model(\'Link\', LinkSchema, \'links\');'
      },
      {
        type: 'delete',
        line: 8,
        content: ''
      },
      {
        type: 'delete',
        line: 9,
        content: 'export default Link; '
      },
    ]);

    expect(lineRanges).toStrictEqual([
      {
        minusRange: {
          start: 1,
          end: 9,
        },
        addRange: {
          start: 0,
          end: -1
        }
      }
    ]);
  });

  test('Patch with multiple new lines', () => {
    const patch = `@@ -8,7 +8,8 @@ import {
  getFirstNodeByValue,
  getNodeByPath,
  findKindWithinRange,
-  getProgressHelper
+  getProgressHelper,
+  extractBaseComments
} from '../helpers';

const JAVA_SYNOPSIS = {
@@ -80,4 +81,7 @@ export default class Java implements PL {
  getProgress(tree: TreeNode, types: ProgressIndicator[]): Progress {
    return getProgressHelper(this, tree, types);
  }
+  extractComment(tree: TreeNode): string {
+      return extractBaseComments(tree);
+  }
}`;
    const { changes, lineRanges } = parsePatch(patch);
    expect(changes).toStrictEqual([
      {
        type: 'delete',
        line: 11,
        content: '  getProgressHelper'
      },
      {
        type: 'add',
        line: 11,
        content: '  getProgressHelper,'
      },
      {
        type: 'add',
        line: 12,
        content: '  extractBaseComments'
      },
      {
        type: 'add',
        line: 84,
        content: '  extractComment(tree: TreeNode): string {'
      },
      {
        type: 'add',
        line: 85,
        content: '      return extractBaseComments(tree);'
      },
      {
        type: 'add',
        line: 86,
        content: '  }'
      },
    ]);
    expect(lineRanges).toStrictEqual([
      {
        minusRange: {
          start: 8,
          end: 14,
        },
        addRange: {
          start: 8,
          end: 15
        }
      },
      {
        minusRange: {
          start: 80,
          end: 83,
        },
        addRange: {
          start: 81,
          end: 87
        }
      }
    ]);
  })

  test('No content', () => {
    const patch = undefined;
    const { changes, lineRanges } = parsePatch(patch);
    expect(changes).toStrictEqual([]);
    expect(lineRanges).toStrictEqual([]);
  })
});