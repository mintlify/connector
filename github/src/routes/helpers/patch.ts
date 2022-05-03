import { LineRange } from './types';

type Change = {
  type: 'add' | 'delete';
  line: number;
  content: string;
}

export type FileInfo = {
  filename: string;
	content: string;
	changes: Change[]
}

export type Alert = {
  url: string;
  message: string;
  filename: string;
  lineRange: LineRange
}

export type PatchLineRange = {
  minusRange: LineRange,
  addRange: LineRange,
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

type Side = 'LEFT' | 'RIGHT'

type RangeAndSide = {
  start: {
    line: number;
    side: Side;
  };
  end: {
    line: number;
    side: Side;
  }
}

export const getEncompassingRangeAndSideForAlert = (patchLineRanges: PatchLineRange[], alertLineRange: LineRange): RangeAndSide => {
  let patchWithLargestEncompassedRange: RangeAndSide = {
    start: {
      line: 0,
      side: 'LEFT'
    },
    end: {
      line: 0,
      side: 'RIGHT'
    }
  };
  patchLineRanges.forEach((patchLineRange) => {
    const isMinusStartSmaller = patchLineRange.minusRange.start <= patchLineRange.addRange.start;
    const smallestStartLine = isMinusStartSmaller ? patchLineRange.minusRange.start : patchLineRange.addRange.start;
    const smallestStartSide = isMinusStartSmaller ? 'LEFT' : 'RIGHT';

    const isPositiveEndLarger = patchLineRange.addRange.end >= patchLineRange.minusRange.end;
    const largestEndLine = isPositiveEndLarger ? patchLineRange.addRange.end : patchLineRange.minusRange.end;
    const largestEndSide = isPositiveEndLarger ? 'RIGHT' : 'LEFT';

    if (Math.min(largestEndLine, alertLineRange.end) - Math.max(smallestStartLine, alertLineRange.start)) {
      patchWithLargestEncompassedRange = {
        start: {
          line: Math.max(smallestStartLine, alertLineRange.start),
          side: smallestStartSide
        },
        end: {
          line: Math.min(largestEndLine, alertLineRange.end),
          side: largestEndSide
        }
      }
    }
  })
  return patchWithLargestEncompassedRange;
}