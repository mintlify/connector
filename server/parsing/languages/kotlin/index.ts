import { PLConnect, TreeNode } from 'parsing/types';
import { extractBaseComments } from '../helpers';

export default class Kotlin implements PLConnect {  
  extractComment(tree: TreeNode): string | null {
    return extractBaseComments(tree);
  }
}