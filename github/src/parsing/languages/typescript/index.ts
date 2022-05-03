import { PLConnect, TreeNode, Skeleton, FileSkeleton } from '../../types';
import { getLineRange } from '../../../routes/helpers/links';
import {
  extractBaseComments,
  nodeIsOnPath,
  findChildByKind,
  getTopComment,
  wrapAround,
  nodeIsOnNextLine
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

const getSkeletonFromNode = (parent: TreeNode, node: TreeNode, i: number, pl: PLConnect, file: string): Skeleton|null => {
  const childBefore = parent.children[i-1];
  let signature = '';
  const comment = childBefore != null ? pl.extractComment(childBefore) : null;
  const lineRange = getLineRange(file, node.value);
  if (nodeIsOnPath(node, TYPESCRIPT_SYNOPSIS.ARROW_FUNCTION.path)) {
    const variableDeclarator = findChildByKind(node, 'variable_declarator');
    if (variableDeclarator != null) {
      const functionName = findChildByKind(variableDeclarator, 'identifier')?.value ?? '';
      const arrowFunction = findChildByKind(variableDeclarator, 'arrow_function')?.value;
      const params = arrowFunction?.substring(0, arrowFunction?.indexOf('=>')).trim();
      signature = `${functionName}${params}`;
    }
  } else if (nodeIsOnPath(node, TYPESCRIPT_SYNOPSIS.VAR_FUNCTION.path)) {
    const variableDeclarator = findChildByKind(node, 'variable_declarator');
    if (variableDeclarator != null) {
      const functionName = findChildByKind(variableDeclarator, 'identifier')?.value ?? '';
      const func = findChildByKind(variableDeclarator, 'function')?.value;
      const bracketIndex = func?.indexOf('{');
      const params = func?.substring(8, bracketIndex).trim();
      signature = `${functionName}${params}`;
    }
  } else if (nodeIsOnPath(node, TYPESCRIPT_SYNOPSIS.FUNCTION_EXPRESSION.path)) {
    const funcDec = findChildByKind(node, 'function_declaration');
    if (funcDec != null) {
      const functionName = findChildByKind(funcDec, 'identifier')?.value ?? '';
      const params = findChildByKind(funcDec, 'formal_parameters')?.value;
      const returnType = findChildByKind(funcDec, 'type_annotation')?.value ?? '';
      signature = `${functionName}${params}${returnType}`;
    }
  }

  if (comment != null && nodeIsOnNextLine(childBefore, node)) {
    return {
      signature,
      lineRange,
      rawDoc: childBefore.value,
      doc: comment,
    };
  }
  return {
    signature,
    lineRange
  };
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
  extractComment(tree: TreeNode) {
    return extractBaseComments(tree);
  }
  getFileSkeleton(tree: TreeNode): FileSkeleton {
    const typesToAvoid = [
      TYPESCRIPT_SYNOPSIS.ARROW_FUNCTION.path,
      TYPESCRIPT_SYNOPSIS.FUNCTION_EXPRESSION.path, 
      TYPESCRIPT_SYNOPSIS.TYPEDEF.path, 
      TYPESCRIPT_SYNOPSIS.VAR_FUNCTION.path
    ];
    const topComment = getTopComment(this, tree, typesToAvoid) ?? undefined;
    const skeletons = getSkeletons(tree);
    return {
      skeletons,
      topComment
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