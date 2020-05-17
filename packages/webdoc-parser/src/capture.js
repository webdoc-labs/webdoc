// @flow
// This file captures all the comments on a node and adds them to a partial-doc tree

import {
  Node,
  isExpressionStatement,
  isClassDeclaration,
  isClassExpression,
  isClassMethod,
  isMemberExpression,
  isThisExpression,
  SourceLocation,
  isScope,
  isClassProperty,
  isFunctionExpression,
} from "@babel/types";
import extract from "./extract";
import {type Doc} from "@webdoc/types";
import {parserLogger, tag} from "./Logger";

// A partial-doc annotated with PD_LIFTED_PROPERTY indicates that the leading comment documents
// the value of the assigned property & not the property itself. For example,
// /**
//  * This describes the class {} (with path ParentClass.ChildClass).
//  */
// ParentClass.ChildClass = class {
//   constructor() {
//     /** I am a member at ParentClass.ChildClass#mem */
//     this.mem = 'val';
//   }
//
// Only lifted up properties are traversed down.
export const PD_LIFTED_PROPERTY = 1 << 0;

// A partial-doc annotated with PD_LEAF indicates that children must not be traversed. This is used
// on properties. PD_LIFTED_PROPERTY and PD_LEAF cannot be used together.
export const PD_LEAF = 1 << 1;

// A partial-doc with the PD_VIRTUAL flag is deleted after its children have been traversed. The
// children are "lifted-up" to the parent's children. These partial-docs **must** have a blank
// name and scope equal to that of the parent.
export const PD_VIRTUAL = 1 << 2;

// PartialDoc is a interim format that holds the context+comment of a documentation.
export type PartialDoc = {
  node: ?Node,
  name: string,
  flags: number,
  path: string[],
  comment: string,
  parent: ?PartialDoc,
  children: PartialDoc[],
  loc: SourceLocation,
  doc?: ?Doc,
  options?: any
};

function equalPartialDocs(doc1: PartialDoc, doc2: PartialDoc): boolean {
  return doc1.loc.start.line === doc2.loc.start.line;
}

// TODO: Merge children. If property=value & value is documented leading the property
// then property's partial-doc will have children[] with partial-doc ready for the value.

function addChildPartialDoc(doc: PartialDoc, scope: PartialDoc): PartialDoc {
  const {children} = scope;
  let index = -1;

  // If another child is a partial-doc of the same comment, replace it.
  for (let i = 0; i < scope.children.length; i++) {
    const child = children[i];

    if (equalPartialDocs(child, doc)) {
      children[i] = doc;
      index = i;
      break;
    }
  }

  // Merging algorithm: If another partial-doc is for the same AST node, then merge doc into
  // it.
  if (index === -1 && doc.node) {
    for (let i = 0; i < scope.children.length; i++) {
      const child = children[i];

      if (child === doc) {
        parserLogger.error(tag.PartialParser, "Same partial doc being added twice");
      }
      if (child.node === doc.node) {
        child.comment += `\n\n${doc.comment}`;

        return child;
      }
    }
  }

  if (index === -1) {
    children.push(doc);
  }

  doc.parent = scope;
  doc.path = [...scope.path, doc.name];

  return doc;
}

function captureDocComment(comments: CommentBlock) {
  for (let i = comments.length - 1; i >= 0; i--) {
    if (comments[i].value.startsWith("*") || comments[i].value.startsWith("!")) {
      return i;
    }
  }

  // Just try the leading comment
  return comments.length - 1;
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
  let flags = 0;

  if (isClassMethod(node) || isClassProperty(node)) {
    name = node.key.name;
  } else if (isClassDeclaration(node)) {
    name = node.id.name;
  } else if (isClassExpression(node) && node.id) {
    name = node.id ? node.id.name : "";
  } else if (isExpressionStatement(node) &&
      isMemberExpression(node.expression.left)) {
    name = node.expression.left.property.name;
    if (isClassExpression(node.expression.right) || isFunctionExpression(node.expression.right)) {
      flags |= PD_LIFTED_PROPERTY | PD_VIRTUAL;
    } else {
      flags |= PD_LEAF;
    }
  }

  let mainPartialDoc: ?PartialDoc = null;
  let nodeDocIndex;

  if (node.leadingComments && node.leadingComments.length > 0) {
    nodeDocIndex = captureDocComment(node.leadingComments);
    const nodeDoc = node.leadingComments[nodeDocIndex];
    const comment = extract(nodeDoc) || "";

    // Does user want to document as a property? Then remove PD_LIFTED_PROPERTY flag
    if ((flags & PD_LIFTED_PROPERTY) && comment.indexOf("@property") !== -1) {
      flags &= ~PD_LIFTED_PROPERTY;
    }

    if (comment && ((flags & PD_LIFTED_PROPERTY) === 0)) {
      mainPartialDoc = {
        node,
        name,
        flags,
        path: [...scope.path, name],
        comment,
        parent: scope,
        children: [],
        loc: nodeDoc.loc,
      };

      mainPartialDoc = addChildPartialDoc(mainPartialDoc, scope);
    } else if (comment && ((flags & PD_LIFTED_PROPERTY) !== 0)) {
      parserLogger.info(tag.PartialParser,
        `Assigned value being documented instead of property: ${[...scope.path, name].join(".")}`);

      mainPartialDoc = {
        node,
        name: "",
        flags,
        comment: "",
        path: [...scope.path],
        parent: scope,
        children: [{
          node: node.expression.right,
          name,
          flags: 0,
          comment: comment,
          parent: scope,
          children: [],
          path: [...scope.path, name],
          loc: nodeDoc.loc,
          options: {
            object: node.expression.left.object.name,
          },
        }],
        loc: nodeDoc.loc,
      };

      mainPartialDoc = addChildPartialDoc(mainPartialDoc, scope);
    }

    for (let i = 0; i < node.leadingComments.length; i++) {
      if (i === nodeDocIndex) {
        continue;
      }

      const comment = extract(node.leadingComments[i]);

      if (!comment) {
        continue;
      }

      addChildPartialDoc(capture.headless(comment, node.leadingComments[i].loc, scope), scope);
    }
  } else if (isScope(node) && name) {
    // Create a "virtual" doc so that documented children can be added. @prune will delete it
    // in the prune doctree-mod.
    mainPartialDoc = {
      node,
      name,
      flags,
      path: [...scope.path, name],
      comment: "@prune",
      parent: scope,
      children: [],
      loc: node.loc,
    };

    mainPartialDoc = addChildPartialDoc(mainPartialDoc, scope);
  }

  const innerComments = node.innerComments;
  const trailingComments = node.trailingComments;

  if (mainPartialDoc && innerComments) {
    innerComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        // $FlowFixMe
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
  flags: 0,
  path: [],
  comment: "",
  parent: null,
  children: [],
  loc: {start: 0, end: 0},
});

capture.headless = (comment: string, loc: SourceLocation, scope: PartialDoc): PartialDoc => ({
  node: null,
  name: "",
  flags: 0,
  path: [...scope.path, ""],
  comment,
  parent: scope,
  children: [],
  loc,
});
