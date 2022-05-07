import { PLConnect, TreeNode } from '../../types';
import {
  extractBaseComments
} from '../helpers';

export default class JavaScript implements PLConnect {
  extractComment(tree: TreeNode) {
    return extractBaseComments(tree);
  }
}