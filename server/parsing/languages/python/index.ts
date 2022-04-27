import { PLConnect, TreeNode } from 'parsing/types';
import {
  removeFrontAndBack,
  removeFront
} from '../helpers';

export default class Python implements PLConnect {  
  extractComment(tree: TreeNode): string | null {
      switch (tree.kind) {
        case 'expression_statement':
          return removeFrontAndBack(tree.value, 3);
        case 'comment':
          return removeFront(tree.value, 1);
        default:
          return null;
      }
  }
}