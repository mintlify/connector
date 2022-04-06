export type Change = {
  type: 'add' | 'delete';
  line: number;
  content: string;
}

export const parsePatch = (patch?: string): Change[] => {
  if (!patch) return [];

  const changes: Change[] = [];
  const lines = patch.split('\n');

  let currentLine = 0;
  let negativeCount = 0;
  for (const line of lines) {
    const firstCharOfLine = line.charAt(0);

    if (line.match(/@@ -[0-9]+,[0-9]+ \+[0-9]+,[0-9]+ @@/)) {
      let startLine = line.match(/[0-9]+/);
      if (startLine) {
        currentLine = parseInt(startLine[0]);
      }

      // Consider for special case where R is 0
      if (currentLine === 0) {
        currentLine = 1;
      }
      continue;
    }

    else if (firstCharOfLine === '-') {
      changes.push({
        type: 'delete',
        line: currentLine,
        content: line.substring(1)
      });

      negativeCount += 1;
    }

    else if (firstCharOfLine === '+') {
      if (negativeCount > 0) {
        currentLine -= negativeCount;
        negativeCount = 0;
      }
      changes.push({
        type: 'add',
        line: currentLine,
        content: line.substring(1)
      });
    }

    else {
      negativeCount = 0;
    }

    currentLine += 1;
  }

  return changes;
}