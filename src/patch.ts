export type Change = {
  type: 'add' | 'delete';
  line: number;
  content: string;
}

export const parsePatch = (patch?: string): Change[] => {
  if (!patch) return [];

  const changes: Change[] = [];
  const lines = patch.split('\n');

  let currentMinusLine = 0;
  let currentAddLine = 0;
  for (const line of lines) {
    const firstCharOfLine = line.charAt(0);

    if (line.match(/@@ -[0-9]+,[0-9]+ \+[0-9]+,[0-9]+ @@/)) {
      currentMinusLine = parseInt(line.match(/-([0-9]+)/)![1])
      currentAddLine = parseInt(line.match(/\+([0-9]+)/)![1])
    }

    else if (firstCharOfLine === '-') {
      changes.push({
        type: 'delete',
        line: currentMinusLine,
        content: line.substring(1)
      });

      currentMinusLine += 1;
    }

    else if (firstCharOfLine === '+') {
      changes.push({
        type: 'add',
        line: currentAddLine,
        content: line.substring(1)
      });

      currentAddLine += 1;
    }

    else {
      currentMinusLine += 1;
      currentAddLine += 1;
    }
  }

  return changes;
}