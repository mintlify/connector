import { PLConnect, TreeNode } from 'parsing/types';
import { extractBaseComments } from '../helpers';

export default class Java implements PLConnect {
  extractComment(tree: TreeNode): string {
      return extractBaseComments(tree);
  }
}