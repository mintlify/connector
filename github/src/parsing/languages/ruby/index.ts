import { PLConnect, TreeNode } from '../../types';
import { removeFront } from '../helpers';

export default class Ruby implements PLConnect {  
  extractComment(tree: TreeNode) {
      switch(tree.kind) {
        case 'comment':
          return removeFront(tree.value, 1);
        default:
          return null;
      }
  }
}