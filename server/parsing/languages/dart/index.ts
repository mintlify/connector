import { PLConnect, TreeNode } from 'parsing/types';
import {
  removeFront,
  extractBaseComments
} from '../helpers';

export default class Dart implements PLConnect {
  extractComment(tree: TreeNode): string {
      switch (tree.kind) {
        case 'documentation_comment':
          return removeFront(tree.value, 3);
        case 'comment':
          return extractBaseComments(tree);
        default:
          return null;
      }
  }
}