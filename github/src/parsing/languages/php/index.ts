import { TreeNode, PLConnect } from '../../types';
import {
  removeFront,
  removeFrontAndBack
} from '../helpers';

export default class PHP implements PLConnect {
  extractComment(tree: TreeNode) {
    if (!['comment', 'block_comment'].includes(tree.kind)) {
      return null;
    }
    const trimmed = tree.value;
    if (trimmed.startsWith('#')) {
      return removeFront(trimmed, 1);
    } else if (trimmed.startsWith('//')) {
      return removeFront(trimmed, 2);
    } else if (trimmed.startsWith('/*')) {
      return removeFrontAndBack(trimmed, 2);
    }
    return null;
  
  }
}