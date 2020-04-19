// @flow

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import {transform} from './transform';
import {RootDoc} from '@webdoc/js-docmodel';
import {Node} from '@babel/types';

export function parse(expr: string, root?: RootDoc = new RootDoc()) {
  const ast = parser.parse(expr);
  const stack = [root];

  traverse(ast, {
    enter(p) {
      const doc = transform(p.node, root);

      if (!doc) {
        return;
      }

      const parent = doc.parent ? doc.parent : stack[stack.length - 1];

      stack.push(doc);
      doc.node = p;

      parent.children.push(doc);
      doc.parentDoc = parent;
    },
    exit(node: Node) {
      const currentPtr = stack[stack.length - 1];

      if (currentPtr.node === node) {
        stack.pop();
      }
    },
  });

  return root;
}
