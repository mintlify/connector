import { TreeNode, PLConnect } from '../../types';
import { 
  extractBaseComments
} from '../helpers';

export default class CPP implements PLConnect {
  extractComment(tree: TreeNode) {
    return extractBaseComments(tree);
  }
}