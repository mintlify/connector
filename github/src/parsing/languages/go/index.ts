import { TreeNode, PLConnect } from '../../types';
import { removeFront } from '../helpers';

export default class Go implements PLConnect {
    extractComment(tree: TreeNode) {
        if (tree.kind !== 'comment') { return null }
        const trimmed = tree.value;
        if (trimmed.startsWith('//')) {
            return removeFront(trimmed, 2);
        }
        return null;
    }
}