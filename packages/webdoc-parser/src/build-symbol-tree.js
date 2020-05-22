// @flow

// This file builds a "symbol"-tree from a JavaScript file.

import {
  type ArrowFunctionExpression,
  type CommentBlock,
  type ClassMethod,
  type FunctionExpression,
  type FunctionDeclaration,
  type InterfaceDeclaration,
  type Node,
  type VariableDeclaration,
  type VariableDeclarator,
  isArrowFunctionExpression,
  isAssignmentPattern,
  isExpressionStatement,
  isClassDeclaration,
  isClassExpression,
  isClassMethod,
  isIdentifer,
  isMemberExpression,
  isFunctionDeclaration,
  SourceLocation,
  isScope,
  isClassProperty,
  isFunctionExpression,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isCallExpression,
  isRestElement,
  isVariableDeclarator,
  isObjectExpression,
  isAssignmentExpression,
  isReturnStatement,
} from "@babel/types";
import * as parser from "@babel/parser";
import traverse, {type NodePath} from "@babel/traverse";

import type {
  DocType,
  Param,
  Return,
} from "@webdoc/types";

import extract from "./extract";
import {type Doc} from "@webdoc/types";
import {parserLogger, tag} from "./Logger";

// Resolve the initialization literal for the variable
function resolveInit(node: VariableDeclarator): Node {
  // Example: const ClassName = exports.ClassName = class ClassName {}
  if (isAssignmentExpression(node.init)) {
    return resolveInit(node.init);
  }

  return node.init;
}

// Resolve the returned symbol for a function expression with a body
function resolveReturn(callee: FunctionExpression | ArrowFunctionExpression): ?string {
  // Example: function () { const Symbol = class {}; return Symbol; }
  if (callee.body && callee.body.body) {
    const body = callee.body.body;
    const lastStatement = body[body.length - 1];

    if (isReturnStatement(lastStatement) && lastStatement.argument && lastStatement.argument.name) {
      return lastStatement.argument.name;
    }
  }
}

// Ignore symbol when building doc-tree
export const PASS_THROUGH = 1 << 0;

// Any members must be ignored and not be included in the doc-tree. These are usually skipped
// in the AST as well. (For example, properties/variables initialized to some value)
export const OBLIGATE_LEAF = 1 << 1;

// Symbol is "virtual" & created by the generator for its own purpose. These symbols are not
// reported to the SymbolParser!
export const VIRTUAL = 1 << 2;

// Symbol is a interim format that holds the context+comment of a documentation.
export type Symbol = {
  node: ?Node,
  name: string,
  flags: number,
  path: string[],
  comment: string,
  parent: ?Symbol,
  children: Symbol[],
  loc: SourceLocation,
  doc?: ?Doc,
  options?: any,
  meta: {
    access?: string,
    dataType?: string,
    extends?: string,
    implements?: string,
    params?: Param[],
    returns?: Return[],
    scope?: string,
    type?: DocType
  }
};

function isPassThrough(symbol: Symbol): boolean {
  return symbol.flags & PASS_THROUGH;
}

function isObligateLeaf(symbol: Symbol): boolean {
  return symbol.flags & OBLIGATE_LEAF;
}

function isVirtual(symbol: Symbol): boolean {
  return symbol.flags & VIRTUAL;
}

// Exported for testing in test/build-symbol-tree.test.js
export const SymbolUtils = {
  // Adds "symbol" as a child to "parent", possibly merging it with an existing symbol. The
  // returned symbol need not be the same as "symbol".
  addChild(doc: Symbol, scope: Symbol): Symbol {
    const {children} = scope;
    let index = -1;

    // Replace symbols when it has the same location but a different node. This occurs
    // when the Node for a comment is found (the symbol being replaced was headless).
    for (let i = 0; i < scope.children.length; i++) {
      const child = children[i];

      if (SymbolUtils.areEqualLoc(child, doc)) {
        children[i] = doc;
        index = i;
        break;
      }
      if (child.name && child.name === doc.name) {
        return SymbolUtils.coalescePair(child, doc);
      }
    }

    // Coalesce Symbols when they refer to the same Node with different names
    if (index === -1 && doc.node && !isVirtual(doc)) {
      for (let i = 0; i < scope.children.length; i++) {
        const child = children[i];

        if (child === doc) {
          parserLogger.error(tag.PartialParser, "Same partial doc being added twice");
        }
        if (child.node === doc.node) {
          child.comment += `\n\n${doc.comment}`;
          child.children.push(...doc.children);
          return child;
        }
      }
    }

    // Append if new child symbol
    if (index === -1) {
      children.push(doc);
    }

    //  if (!isVirtual(doc)) {
    doc.parent = scope;
    doc.path = [...scope.path, doc.name];
    //  } else {
    //    doc.parent = scope;
    //    doc.path = [...scope.path];
    //  }

    return doc;
  },
  // Coalesce "pair" into "symbol" because they refer to the same symbol (by name)
  coalescePair(symbol: Symbol, pair: Symbol): Symbol {
    const children = symbol.children;
    const comment = symbol.comment;
    const flags = symbol.flags;

    symbol.children.push(...pair.children);

    Object.assign(symbol, pair);
    symbol.comment = comment || pair.comment;
    symbol.children = children;
    symbol.flags = symbol.flags ? symbol.flags | pair.flags : pair.flags;
    symbol.meta = Object.assign(symbol.meta, pair.meta);

    // Horizontal transfer of children
    for (let i = 0; i < pair.children.length; i++) {
      pair.children[i].parent = symbol;
    }

    return symbol;
  },
  areEqualLoc(doc1: Symbol, doc2: Symbol): boolean {
    return doc1.loc.start && doc2.loc.start && doc1.loc.start.line === doc2.loc.start.line;
  },
  hasLoc(sym: Symbol): boolean {
    return typeof sym.loc.start !== "undefined" && sym.loc.start !== null;
  },
  commentIndex(comments: CommentBlock): number {
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].value.startsWith("*") || comments[i].value.startsWith("!")) {
        return i;
      }
    }

    // Just try the leading comment
    return comments.length - 1;
  },
  createModuleSymbol(): Symbol {
    return {
      node: null,
      name: "File",
      flags: 0,
      path: [],
      comment: "",
      parent: null,
      children: [],
      loc: {start: 0, end: 0},
    };
  },
  createHeadlessSymbol(comment: string, loc: SourceLocation, scope: Symbol): Symbol {
    return {
      node: null,
      name: "",
      flags: 0,
      path: [...scope.path, ""],
      comment,
      parent: scope,
      children: [],
      loc: loc || {},
    };
  },

};

const babelPlugins = [
  "asyncGenerators",
  "bigInt",
  "classPrivateMethods",
  "classPrivateProperties",
  "classProperties",
  "doExpressions",
  "dynamicImport",
  "exportDefaultFrom",
  "flow",
  "flowComments",
  "functionBind",
  "functionSent",
  "importMeta",
  "jsx",
  "logicalAssignment",
  "nullishCoalescingOperator",
  "numericSeparator",
  "objectRestSpread",
  "optionalCatchBinding",
  "optionalChaining",
  "throwExpressions",
];

// These vistiors kind of "fix" the leadingComments by moving them in front of the intended
// AST node.
const extraVistors = {
  // Move comments before variable-declaration to infront of the declared identifer if
  // there are no inline comments.
  VariableDeclaration(nodePath: NodePath): void {
    const node: VariableDeclaration = (nodePath.node : any);

    if (node.leadingComments &&
          node.declarations &&
          node.declarations.length &&
          !node.declarations[0].leadingComments
    ) {
      node.declarations[0].leadingComments = node.leadingComments;
      node.leadingComments = [];
    }
  },
};

// Parses the file and returns a tree of symbols
export default function buildSymbolTree(file: string, fileName?: string): Symbol {
  const module: Symbol = SymbolUtils.createModuleSymbol();
  let ast;

  try {
    ast = parser.parse(file, {
      plugins: [...babelPlugins],
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (e) {
    console.error("Babel couldn't parse file in @webdoc/parser/parse.js#partial");
    throw e;
  }

  const ancestorStack: Symbol[] = [module];

  traverse(ast, {
    enter(nodePath: NodePath) {
      const node = nodePath.node;

      if (extraVistors.hasOwnProperty(node.type)) { // eslint-disable-line no-prototype-builtins
        extraVistors[node.type](nodePath);
      }

      // Make exports transparent
      if (node.leadingComments &&
          (isExportNamedDeclaration(node) || isExportDefaultDeclaration(node)) &&
          node.declaration) {
        const declaration = nodePath.node.declaration;

        declaration.leadingComments = declaration.leadingComments || [];
        declaration.leadingComments.push(...node.leadingComments);

        // Prevent ghost docs
        node.leadingComments = [];
      }

      const scope = ancestorStack[ancestorStack.length - 1];
      let idoc;

      try {
        idoc = captureSymbols(nodePath.node, scope);
      } catch (e) {
        console.error(ancestorStack);
        console.log(node);
        console.error(ancestorStack.map((symbol) =>
          symbol.name +
          `@{${symbol.comment}}[${symbol.node ? symbol.node.type : "Headless"}]`));
        throw e;
      }

      if (idoc) {
        if (!isVirtual(idoc) && !idoc.node) {
          console.log(node);
          console.log(idoc);
          throw new Error("WTF");
        }
        ancestorStack.push(idoc);
      }
    },
    exit(nodePath: NodePath) {
      const currentPardoc = ancestorStack[ancestorStack.length - 1];

      if (currentPardoc && currentPardoc.node === nodePath.node) {
        ancestorStack.pop();

        // Delete PASS_THROUGH flagged partial-docs & lift up their children.
        if (isVirtual(currentPardoc)) {
          const parentPardoc: Symbol = (currentPardoc.parent: any);

          parentPardoc.children.splice(parentPardoc.children.indexOf(currentPardoc), 1);
          // parentPardoc.children.push(...currentPardoc.children);

          for (let i = 0; i < currentPardoc.children.length; i++) {
            SymbolUtils.addChild(currentPardoc.children[i], parentPardoc);
            // currentPardoc.children[i].parent = parentPardoc;
          }
        }
      }
    },
  });

  // The only ancestor left should be the module-symbol.
  if (ancestorStack.length > 1) {
    console.error(ancestorStack);
    console.error(ancestorStack.map((symbol) =>
      symbol.name +
      `@{${symbol.comment}}[${symbol.node ? symbol.node.type : "Headless"}]`));
    throw new Error("@webdoc/parser failed to correctly finish the symbol-tree.");
  }

  return module;
}

// Finds all the documented symbols (including headless documentation blocks) near this node.
function captureSymbols(node: Node, parent: Symbol): ?Symbol {
  let name = "";
  let flags = 0;
  let init;
  let initComment;
  let isInit = false;

  let nodeSymbol: ?Symbol = {meta: {}};
  let nodeDocIndex;

  if (isClassMethod(node) && node.kind === "method") {
    // classMethod() {}
    name = node.key.name;

    nodeSymbol.meta.access = node.access;
    nodeSymbol.meta.scope = node.static ? "static" : "instance";
    nodeSymbol.meta.type = "MethodDoc";
  } else if (isClassProperty(node) ||
      (isClassMethod(node) && (node.kind === "get" || node.kind === "set"))) {
    // classProperty = "value";
    // get classProperty() { return "value"; }

    name = node.key.name;

    nodeSymbol.meta.access = node.access;
    nodeSymbol.meta.scope = node.static ? "static" : "instance";
    nodeSymbol.meta.type = "PropertyDoc";
  } else if (isClassDeclaration(node) || isClassExpression(node)) {
    // class ClassName {}

    name = node.id ? node.id.name : "";

    nodeSymbol.meta.type = "ClassDoc";
  } else if (isFunctionDeclaration(node)) {
    // function functionName()

    name = node.id ? node.id.name : "";

    nodeSymbol.meta.type = "FunctionDoc";
  } else if (
    isVariableDeclarator(node) ||
    (isExpressionStatement(node) && isMemberExpression(node.expression.left))
  ) {
    if (isExpressionStatement(node)) {
      name = node.expression.left.property.name;
    } else if (isVariableDeclarator(node)) {
      name = node.id.name;
    }

    init = isExpressionStatement(node) && isMemberExpression(node.expression.left) ?
      node.expression.right : resolveInit(node);

    if (isClassExpression(init) || isFunctionExpression(init) ||
        (isCallExpression(init) &&
        (isFunctionExpression(init.callee) || isArrowFunctionExpression(init.callee)))) {
      flags |= PASS_THROUGH | VIRTUAL;
      isInit = true;
    } else if (!isObjectExpression(init)) {
      flags |= OBLIGATE_LEAF;
    }
  } else if (parent && isVirtual(parent) &&
    isCallExpression(node) &&
    (isFunctionExpression(node.callee) || isArrowFunctionExpression(node.callee))) {
    flags |= VIRTUAL;
    const callee = node.callee;
    const returnedSymbol = resolveReturn(callee);

    if (returnedSymbol) {
      isInit = true;
      initComment = parent.comment || " ";
      name = returnedSymbol;
    }
  }

  if (initComment || (node.leadingComments && node.leadingComments.length > 0)) {
    if (!initComment) {
      nodeDocIndex = SymbolUtils.commentIndex(node.leadingComments);
    }
    const nodeDoc = typeof nodeDocIndex === "number" ? node.leadingComments[nodeDocIndex] : null;
    const comment = initComment || extract(nodeDoc) || "";

    const leadingComments = node.leadingComments || [];

    // Does user want to document as a property? Then remove PASS_THROUGH flag
    if ((flags & VIRTUAL) && comment.indexOf("@property") !== -1) {
      flags &= ~VIRTUAL;
    }

    if (comment && ((flags & VIRTUAL) === 0)) {
      nodeSymbol = Object.assign({
        node,
        name,
        flags,
        path: [...parent.path, name],
        comment,
        parent: parent,
        children: [],
        loc: nodeDoc ? nodeDoc.loc : {},
      }, nodeSymbol);

      nodeSymbol = SymbolUtils.addChild(nodeSymbol, parent);
    } else if (comment && isInit) {
      nodeSymbol = Object.assign({
        node,
        name: "",
        flags,
        comment: "",
        path: [...parent.path],
        parent: parent,
        children: [{
          node: init,
          name,
          flags: 0,
          comment,
          parent: parent,
          children: [],
          path: [...parent.path, name],
          loc: nodeDoc ? nodeDoc.loc : {},
          options: {
            object: node.expression ? node.expression.left.object.name : undefined,
          },
          meta: {},
        }],
        loc: nodeDoc ? nodeDoc.loc : {},
        virtual: true,
      }, nodeSymbol);

      nodeSymbol = SymbolUtils.addChild(nodeSymbol, parent);
    } else {
      nodeSymbol = null;
    }

    for (let i = 0; i < leadingComments.length; i++) {
      if (i === nodeDocIndex) {
        continue;
      }

      const comment = extract(leadingComments[i]);

      if (!comment) {
        continue;
      }

      SymbolUtils.addChild(
        SymbolUtils.createHeadlessSymbol(comment, leadingComments[i].loc, parent),
        parent);
    }
  } else if (isScope(node) && name) {
    // Create a "virtual" doc so that documented children can be added. @prune will delete it
    // in the prune doctree-mod.
    nodeSymbol = Object.assign({
      node,
      name,
      flags,
      path: [...parent.path, name],
      comment: "",
      parent: parent,
      children: [],
      loc: node.loc,
    }, nodeSymbol);

    nodeSymbol = SymbolUtils.addChild(nodeSymbol, parent);
  } else {
    nodeSymbol = undefined;
  }

  const innerComments = node.innerComments;
  const trailingComments = node.trailingComments;

  if (nodeSymbol && innerComments) {
    innerComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        // $FlowFixMe
        SymbolUtils.addChild(
          SymbolUtils.createHeadlessSymbol(doc, comment.loc, nodeSymbol),
          nodeSymbol);
      }
    });
  }
  if (trailingComments) {
    // trailing comments re-occur if they "lead" a node afterward. SymbolUtils.addChild will
    // replace.
    trailingComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        const tsym = SymbolUtils.createHeadlessSymbol(doc, comment.loc, parent);
        SymbolUtils.addChild(tsym, parent);
      }
    });
  }

  return nodeSymbol;
}

// Extract all the parameter-data from the method/function AST node
function extractParams(node: ClassMethod | FunctionDeclaration | FunctionExpression): Param[] {
  if (!node.params) {
    return [];
  }

  const params: Param[] = [];

  for (let i = 0; i < node.params.length; i++) {
    const paramNode = node.params[i];

    // TODO: Infer types
    if (isIdentifer(paramNode)) {
      params.push({
        identifer: paramNode.name,
        optional: paramNode.optional || false,
      });
    } else if (isRestElement(paramNode)) {
      params.push({
        identifer: paramNode.argument.name,
        optional: paramNode.optional || false,
        variadic: true,
      });
    } else if (isAssignmentPattern(paramNode)) {
      params.push({
        identifer: paramNode.left.name,
        optional: paramNode.optional || false,
        default: paramNode.right.raw,
      });
    } else if (isObjectExpression(paramNode)) {
      // TODO: Find a way to document {x, y, z} parameters
      // e.g. function ({x, y, z}), you would need to give the object pattern an anonymous like
      // "", " ", "  ",  "    " or using &zwnj; because it is truly invisible
      console.error("Object patterns as parameters can't be documented");
    } else {
      console.error("Parameter node couldn't be parsed");
    }
  }

  return params;
}
