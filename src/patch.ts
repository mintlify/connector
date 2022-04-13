export type Change = {
  type: 'add' | 'delete';
  line: number;
  content: string;
}

type LineRange = {
  minusRange: {
    start: number,
    end: number, // inclusive
  },
  addRange: {
    start: number,
    end: number, // inclusive
  },
}

export const parsePatch = (patch?: string): { changes: Change[], lineRanges: LineRange[] } => {
  if (!patch) return { changes: [], lineRanges: [] };

  const changes: Change[] = [];
  const lineRanges: LineRange[] = [];
  const lines = patch.split('\n');

  let currentMinusLine = 0;
  let currentAddLine = 0;
  for (const line of lines) {
    const firstCharOfLine = line.charAt(0);

    if (line.match(/@@ -[0-9]+,[0-9]+ \+[0-9]+,[0-9]+ @@/)) {
      const minusLine = line.match(/-([0-9]+),([0-9]+)/);
      const addLine = line.match(/\+([0-9]+),([0-9]+)/);
      currentMinusLine = parseInt(minusLine![1])
      currentAddLine = parseInt(addLine![1])

      let minusLinesDiff = parseInt(minusLine![2]);
      let addLinesDiff = parseInt(addLine![2]);

      lineRanges.push({
        minusRange: {
          start: currentMinusLine,
          end: currentMinusLine + minusLinesDiff - 1
        },
        addRange: {
          start: currentAddLine,
          end: currentAddLine + addLinesDiff - 1
        }
      })
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

  return { changes, lineRanges };
}