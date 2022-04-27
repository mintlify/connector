import { PLConnect, TreeNode } from 'parsing/types';
import { extractBaseComments } from '../helpers';

export default class TypeScript implements PLConnect {  
  extractComment(tree: TreeNode): string | null {
    return extractBaseComments(tree);
  }
}