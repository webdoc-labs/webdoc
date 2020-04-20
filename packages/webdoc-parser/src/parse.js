// @flow

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import {transform} from './transform';
import {type Doc, RootDoc} from '@webdoc/model';
import {Node} from '@babel/types';

export function parse(expr: string, root?: RootDoc = new RootDoc()) {
  const ast = parser.parse(expr);
  const stack: Doc[] = [root];

  traverse(ast, {
    enter(node: Node) {
      const doc = transform(node.node, root);

      if (!doc) {
        return;
      }

      const parent = doc.parent ? doc.parent : stack[stack.length - 1];

      stack.push(doc);
      doc.node = node;

      parent.addChild(doc);
    },
    exit(node: Node) {
      const currentPtr = stack[stack.length - 1];

      if (currentPtr.node === node) {
        stack.pop();
        currentPtr.node = null;
      }
    },
  });

  return root;
}
