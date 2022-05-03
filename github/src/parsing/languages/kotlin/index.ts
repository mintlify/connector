import { PLConnect, TreeNode } from '../../types';
import { extractBaseComments } from '../helpers';

export default class Kotlin implements PLConnect {  
  extractComment(tree: TreeNode): string | null {
    return extractBaseComments(tree);
  }
}