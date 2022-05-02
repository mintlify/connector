import { PLConnect, TreeNode, Skeleton, FileSkeleton } from 'parsing/types';
import { getLineRange } from 'routes/v01/links';
import {
  extractBaseComments,
  nodeIsOnPath,
  findChildByKind,
  getTopComment,
  wrapAround
} from '../helpers';


const TYPESCRIPT_SYNOPSIS = {
  ARROW_FUNCTION: {
    path: ['lexical_declaration', 'variable_declarator', 'arrow_function'],
    excludes: ['program', 'export_statement']
  },
  VAR_FUNCTION: {
    path: ['lexical_declaration', 'variable_declarator', 'function'],
    excludes: ['program', 'export_statement']
  },
  FUNCTION_EXPRESSION: {
    path: ['function_declaration'],
    excludes: ['program', 'export_statement']
  },
  METHOD: {
    path: ['method_definition'],
    excludes: ['program'],
  },
  TYPEDEF: {
    path: ['type_alias_declaration'],
    excludes: ['program', 'export_statement']
  },
  CLASS: {
    path: ['class_declaration'],
    excludes: ['program', 'export_statement']
  }
}

const getSkeletonFromNode = (parent: TreeNode, node: TreeNode, i: number, pl: PLConnect, file: string): Skeleton => {
  const comment = pl.extractComment(node);
  if (comment == null) {
    return null;
  }
  const nextChild = parent.children[i+1];
  if (nodeIsOnPath(nextChild, TYPESCRIPT_SYNOPSIS.ARROW_FUNCTION.path)) {
    // get signature
    const variableDeclarator = findChildByKind(nextChild, 'variable_declarator');
    const functionName = findChildByKind(variableDeclarator, 'identifier').value;
    const arrowFunction = findChildByKind(variableDeclarator, 'arrow_function').value;
    const params = arrowFunction.substring(0, arrowFunction.indexOf('=>')).trim();
    const signature = `${functionName}${params}`;
    const lineRange = getLineRange(file, nextChild.value);
    return {
      signature,
      doc: comment,
      rawDoc: node.value,
      lineRange
    };
  }
}

const getSkeletons = (tree: TreeNode): Skeleton[] => {
  if (tree.children == null) { return []; }
  const childNodes = tree.children;

  let skeletons: Skeleton[] = [];
  childNodes.forEach((node, i) => {
    const skeleton = getSkeletonFromNode(tree, node, i, new TypeScript, tree.value);
    if (skeleton != null) {
      skeletons.push(skeleton);
    }
    if (node.children != null) {
      const childSkeletons = getSkeletons(node);
      skeletons = skeletons.concat(childSkeletons);
    }
  });
  return skeletons;
}

export default class TypeScript implements PLConnect {  
  extractComment(tree: TreeNode): string | null {
    return extractBaseComments(tree);
  }
  getFileSkeleton(tree: TreeNode): FileSkeleton {
    const typesToAvoid = [
      TYPESCRIPT_SYNOPSIS.ARROW_FUNCTION.path,
      TYPESCRIPT_SYNOPSIS.FUNCTION_EXPRESSION.path, 
      TYPESCRIPT_SYNOPSIS.TYPEDEF.path, 
      TYPESCRIPT_SYNOPSIS.VAR_FUNCTION.path
    ];
    const topComment = getTopComment(this, tree, typesToAvoid);
    const skeletons = getSkeletons(tree);
    return {
      topComment,
      skeletons
    };
  }
  comment(str: string): string {
    if (str.trim().split('/n').length > 1) {
      const starredCode = str.split('\n').map((line) => ` * ${line}`).join('\n');
      return wrapAround(starredCode, '/**', ' */', true);
    }
    return `// ${str}`;
  }
}