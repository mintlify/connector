import { TreeNode, PLConnect } from 'parsing/types';
import { 
  extractBaseComments
} from '../helpers';

export default class C implements PLConnect {
  extractComment(tree: TreeNode): string {
    return extractBaseComments(tree);
  }
}