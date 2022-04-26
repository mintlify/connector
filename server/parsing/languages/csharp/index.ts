import { TreeNode, PLConnect } from 'parsing/types';
import {
  extractBaseComments
} from '../helpers';

export default class CSharp implements PLConnect {
  extractComment(tree: TreeNode): string {
      return extractBaseComments(tree);
  }
}