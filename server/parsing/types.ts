import { LineRange } from 'routes/v01/types';

export type TreeNode = {
  kind: string;
  value: string;
  start: number;
  end: number;
  is_error: boolean,
  children: TreeNode[],
}

export type Program = {
  has_error: boolean;
  root: TreeNode;
}

export type Skeleton = {
  signature: string;
  lineRange?: LineRange;
  doc: string;
  url?: string;
  rawDoc?: string;
}

export type FileSkeleton = {
  topComment: string;
  skeletons: Skeleton[];
  filename?: string;
}

export interface PLConnect {
  // Extract content inside a comment
  extractComment(tree: TreeNode): string | null;
  // For Gitbook integration
  getFileSkeleton?(tree: TreeNode): FileSkeleton;
}
