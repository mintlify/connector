export type Change = {
  type: 'add' | 'delete';
  line: number;
  content: string;
}

export type PatchLineRange = {
  minusRange: {
    start: number,
    end: number, // inclusive
  },
  addRange: {
    start: number,
    end: number, // inclusive
  },
}

export const parsePatch = (patch?: string): { changes: Change[], patchLineRanges: PatchLineRange[] } => {
  if (!patch) return { changes: [], patchLineRanges: [] };

  const changes: Change[] = [];
  const patchLineRanges: PatchLineRange[] = [];
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

      patchLineRanges.push({
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

  return { changes, patchLineRanges };
}