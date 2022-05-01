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
export interface PLConnect {
  // Extract content inside a comment
  extractComment(tree: TreeNode): string | null;
}
