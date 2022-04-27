import { PLConnect, TreeNode } from 'parsing/types';
import {
  extractBaseComments
} from '../helpers';

export default class JavaScript implements PLConnect {
  extractComment(tree: TreeNode): string | null {
    return extractBaseComments(tree);
  }
}