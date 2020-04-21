// @flow

import {
  Node,
  isExpressionStatement,
  isClassDeclaration,
  isClassMethod,
  isMemberExpression,
  isThisExpression,
} from '@babel/types';

import extract from './extract';

/*
// These tags define what is being documented and override the actual code.
const TAG_MAP = {
  'class': (options) => {
    return new ClassDoc({...options, name: options.node.id.name});
  },
  'method': (options) => {
    return new MethodDoc({...MethodDoc.options, name: options.node.key.name});
  },
};

const TAG_PARSERS = {
  'member': MemberTag.parse,
};

function createDoc(options: { tags: Tag[], node: Node, [id:string]: any }) {
  const {tags, node} = options;

  for (let i = 0; i < tags.length; i++) {
    if (TAG_MAP[tags[i].name]) {
      return TAG_MAP[tags[i].name](options);
    }
  }

  if (isClassDeclaration(node)) {
    return new ClassDoc({...options, name: node.id.name});
  }
  if (isClassMethod(node)) {
    return new MethodDoc({...options, name: node.key.name});
  }
  if (isExpressionStatement(node) &&
      isMemberExpression(node.expression.left) &&
      isThisExpression(node.expression.left.object)) {
    const memberTag = tags.find((tag) => tag.name === 'member');

    return new PropertyDoc({
      ...options,
      name: node.expression.left.property.name,
      type: memberTag ? memberTag.typePath : '',
    });
  }

  return null;
}*/

export type DocableExpression = {
  node: Node,
  name: string,
  path: string[],
  comment: string
};


/**
 * Transforms the Babel AST node into a {@code DocableExpression}, if documentation has been added.
 *
 * @param {Node} node
 * @param {string[]} scope - the documentation tree
 * @return {Doc}
 */
export function docable(node: Node, scope: string[]): DocableExpression[] {
  const docs: DocableExpression[] = [];

  if (!node.leadingComments) {
    return [];
  }

  let name = '';

  if (isClassMethod(node)) {
    name = node.key.name;
  } else if (isClassDeclaration(node)) {
    name = node.id.name;
  } else if (isExpressionStatement(node) &&
      isMemberExpression(node.expression.left) &&
      isThisExpression(node.expression.left.object)) {
    name = node.expression.left.property.name;
  }

  for (let i = 0; i < node.leadingComments.length; i++) {
    if (node.leadingComments[i].documented) {
      continue;
    }

    const comment = extract(node.leadingComments[i]);

    if (!comment) {
      continue;
    }

    if (i === node.leadingComments.length - 1) {
      docs.push({
        node,
        name,
        path: [...scope, name],
        comment,
      });
    } else {
      docs.push({
        node: null,
        name: '',
        path: [...scope, ''],
        comment,
      });
    }
  }

  return docs;
}
