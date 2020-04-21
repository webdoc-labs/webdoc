// @flow

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import extract from './extract';
import {docable, type DocableExpression} from './transform';
import {Node} from '@babel/types';

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
  isExpressionStatement,
  isClassDeclaration,
  isClassMethod,
  isMemberExpression,
  isThisExpression,
} from '@babel/types';
import {TypedefDoc} from '@webdoc/model';


// These tags define what is being documented and override the actual code.
const TAG_MAP = {
  'class': (options) => {
    return new ClassDoc({...options, name: options.node.id.name});
  },
  'method': (options) => {
    return new MethodDoc({...MethodDoc.options, name: options.node.key.name});
  },
  'typedef': (options) => new TypedefDoc({...options, name: 'tbh'}),
};

const TAG_PARSERS = {
  'member': MemberTag.parse,
};

function parseInterim(expr: string): DocableExpression[] {
  const ast = parser.parse(expr);
  const stack: DocableExpression[] = [];
  const docs: DocableExpression[] = [];

  traverse(ast, {
    enter(node: Node) {
      const scope = stack[stack.length - 1];
      const nodeDocs = docable(node.node, scope ? scope.path : []);

      docs.push(...nodeDocs);

      if (nodeDocs.length > 0) {
        nodeDocs[nodeDocs.length - 1].node = node;
        stack.push(nodeDocs[nodeDocs.length - 1]);
      }
    },
    exit(node: Node) {
      const currentPtr = stack[stack.length - 1];

      if (currentPtr && currentPtr.node === node) {
        stack.pop();
      }
    },
  });

  if (stack.length > 1) {
    console.error('Scope erro');
  }

  for (let i = 0; i < ast.comments.length; i++) {
    if (!ast.comments[i].documented) {
      const comment = extract(ast.comments[i]);

      if (comment) {
        docs.push({
          node: null,
          name: '',
          path: [],
          comment,
        });
      }
    }
  }

  // Sort in order of scoping
  docs.sort((d1, d2) => d1.path.length - d2.path.length);

  return docs;
}

function parseDocable(docable: DocableExpression): ?Doc {
  const {comment, node} = docable;
  const commentLines = comment.split('\n');

  const tags: Tag[] = [];

  for (let i = 0; i < commentLines.length; i++) {
    if (commentLines[i].startsWith('@')) {
      const tokens = commentLines[i].split(' ');
      const tag = tokens[0].replace('@', '');

      let value = tokens.slice(1).join('');

      for (let j = i + 1; j < commentLines.length; j++) {
        if (commentLines[j].startsWith('@') || !commentLines[j]) {
          break;
        }

        value += '\n' + commentLines[i];
      }

      if (TAG_PARSERS[tag]) {
        tags.push(TAG_PARSERS[tag](value));
      } else {
        tags.push(Tag.parse(tag, value));
      }
    }
  }

  const options = {tags, node};
  console.log(tags);

  for (let i = 0; i < tags.length; i++) {
    if (TAG_MAP[tags[i].name]) {
      return TAG_MAP[tags[i].name](options);
    }
  }
  if (!node) {
    return null;
  }

  if (isClassDeclaration(node)) {
    return new ClassDoc({...options, name: node.node.id.name});
  }
  if (isClassMethod(node)) {
    return new MethodDoc({...options, name: node.node.key.name});
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

export function parse(file: string, root?: RootDoc = new RootDoc()): RootDoc {
  const docables = parseInterim(file);

  for (let i = 0; i < docables.length; i++) {
    const docable = docables[i];

    const scope = docable.path.slice(0, docable.path.length - 1);
    const parent = root.doc(scope);

    if (!parent) {
      throw new Error(`${scope.join('.')} does not exist (in parsing ${docable.path.join('.')})`);
    }

    const doc = parseDocable(docable);

    if (doc) {
      parent.addChild(doc);
      (doc:any).node = null;

      console.log('Documented ' + doc.path);
    }
  }

  return root;
}
