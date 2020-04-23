// @flow
// This file captures all the comments on a node and adds them to a partial-doc tree

import {
  Node,
  isExpressionStatement,
  isClassDeclaration,
  isClassMethod,
  isMemberExpression,
  isThisExpression,
  SourceLocation,
  isScope,
  isClass,
  isBlockStatement,
} from "@babel/types";
import extract from "./extract";
import {Doc} from "@webdoc/model";

// PartialDoc is a interim format that holds the context+comment of a documentation.
export type PartialDoc = {
  node: ?Node,
  name: string,
  path: string[],
  comment: string,
  parent: ?PartialDoc,
  children: PartialDoc[],
  loc: SourceLocation,
  doc?: ?Doc
};

function equalPartialDocs(doc1: PartialDoc, doc2: PartialDoc): boolean {
  return doc1.loc.start.line === doc2.loc.start.line;
}

function addChildPartialDoc(doc: PartialDoc, scope: PartialDoc): PartialDoc {
  const {children} = scope;
  let index = -1;

  for (let i = 0; i < scope.children.length; i++) {
    const child = children[i];

    if (equalPartialDocs(child, doc)) {
      children[i] = doc;
      index = i;
      break;
    }
  }

  if (index === -1) {
    children.push(doc);
  }

  doc.parent = scope;
  doc.path = [...scope.path, doc.name];

  return doc;
}

/**
 * Transforms the Babel AST node into a {@code PartialDoc}, if documentation has been added.
 *
 * @param {Node} node - the ast node
 * @param {PartialDoc} scope - the partial-doc of the scope inside which the node exists
 * @return {?PartialDoc}
 */
export default function capture(node: Node, scope: PartialDoc): ?PartialDoc {
  let name = "";

  if (isClassMethod(node)) {
    name = node.key.name;
  } else if (isClassDeclaration(node)) {
    name = node.id.name;
  } else if (isExpressionStatement(node) &&
      isMemberExpression(node.expression.left) &&
      isThisExpression(node.expression.left.object)) {
    name = node.expression.left.property.name;
  }

  let mainPartialDoc;

  if (node.leadingComments && node.leadingComments.length > 0) {
    const nodeDoc = node.leadingComments[node.leadingComments.length - 1];
    const comment = extract(nodeDoc);

    if (comment) {
      mainPartialDoc = {
        node,
        name,
        path: [...scope.path, name],
        comment,
        parent: scope,
        children: [],
        loc: nodeDoc.loc,
      };

      addChildPartialDoc(mainPartialDoc, scope);
    }

    for (let i = 0; i < node.leadingComments.length - 1; i++) {
      const comment = extract(node.leadingComments[i]);

      if (!comment) {
        continue;
      }

      addChildPartialDoc(capture.headless(comment, node.leadingComments[i].loc, scope), scope);
    }
  } else if (isScope(node) && name) {
    mainPartialDoc = {
      node,
      name,
      path: [...scope.path, name],
      comment: "@prune",
      parent: scope,
      children: [],
      loc: node.loc,
    };

    addChildPartialDoc(mainPartialDoc, scope);
  }

  const innerComments = node.innerComments;
  const trailingComments = node.trailingComments;

  if (mainPartialDoc && innerComments) {
    innerComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        addChildPartialDoc(capture.headless(doc, comment.loc, mainPartialDoc), mainPartialDoc);
      }
    });
  }
  if (trailingComments) {
    // trailing comments re-occur if they "lead" a node afterward. addChildPartialDoc will replace.
    trailingComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        addChildPartialDoc(capture.headless(doc, comment.loc, scope), scope);
      }
    });
  }

  return mainPartialDoc;
}

capture.root = (): PartialDoc => ({
  node: null,
  name: "File",
  path: [],
  comment: "",
  parent: null,
  children: [],
  loc: {start: 0, end: 0},
});

capture.headless = (comment: string, loc: SourceLocation, scope: PartialDoc): PartialDoc => ({
  node: null,
  name: "",
  path: [...scope.path, ""],
  comment,
  parent: scope,
  children: [],
  loc,
});
