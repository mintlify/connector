import { PLConnect, TreeNode } from 'parsing/types';
import {
  removeFront
} from '../helpers';

export default class Ruby implements PLConnect {  
  extractComment(tree: TreeNode): string | null {
      switch(tree.kind) {
        case 'comment':
          return removeFront(tree.value, 1);
        default:
          return null;
      }
  }
}