import { TreeNode, PLConnect } from 'parsing/types';
import { removeFront } from '../helpers';

export default class Rust implements PLConnect {
    extractComment(tree: TreeNode): string {
        if (tree.kind !== 'line_comment') { return null; }
        const trimmed = tree.value;
        if (trimmed.startsWith('//')) {
            return removeFront(trimmed, 2);
        }
        return null;
    }
}
