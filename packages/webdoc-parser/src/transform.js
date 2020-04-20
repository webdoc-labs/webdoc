// @flow

import {
  ClassDoc,
  MethodDoc,
  Tag,
  RootDoc,
  Doc,
  PropertyDoc,
  MemberTag,
} from '@webdoc/model';

import {
  Node,
  isExpressionStatement,
  isClassDeclaration,
  isClassMethod,
  isMemberExpression,
  isThisExpression,
} from '@babel/types';

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
}

/**
 * Transforms the Babel AST node into a {@code Doc}, if documentation has been added.
 *
 * @param {Node} node
 * @param {RootDoc} root - the documentation tree
 * @return {Doc}
 */
export function transform(node: Node, root?: RootDoc): Doc {
  if (!node.leadingComments) {
    return;
  }
  let input = node.leadingComments[node.leadingComments.length - 1].value;

  if (!input) {
    return;
  }

  input = input.split('\n');

  const tags = [];

  for (let i = 0; i < input.length; i++) {
    input[i] = input[i].trim();

    if (input[i].startsWith('*')) {
      input[i] = input[i].replace('*', '').trimStart();
    }
  }

  for (let i = 0; i < input.length; i++) {
    if (input[i].startsWith('@')) {
      const tokens = input[i].split(' ');
      const tag = tokens[0].replace('@', '');

      let value = tokens.slice(1).join('');

      for (let j = i + 1; j < input.length; j++) {
        if (input[j].startsWith('@') || !input[j]) {
          break;
        }

        value += '\n' + input[i];
      }

      if (TAG_PARSERS[tag]) {
        tags.push(TAG_PARSERS[tag](value));
      } else {
        tags.push(Tag.parse({name: tag, value}));
      }
    }
  }

  const doc = createDoc({
    tags,
    node,
  });

  for (let i = 0; i < tags.length; i++) {
    tags[i].doc = doc;
  }

  return doc;
}
