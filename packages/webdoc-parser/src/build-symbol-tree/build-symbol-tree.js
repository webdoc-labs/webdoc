// @flow

// This file implements the construction of a symbol-tree for JavaScript/Flow/TypeScript code.

import {
  type ArrowFunctionExpression,
  type CommentBlock,
  type FunctionExpression,
  type MemberExpression,
  type Node,
  type VariableDeclaration,
  type VariableDeclarator,
  isArrowFunctionExpression,
  isBlockStatement,
  isExpressionStatement,
  isClassDeclaration,
  isClassExpression,
  isClassMethod,
  isInterfaceDeclaration,
  isMemberExpression,
  isFunctionDeclaration,
  SourceLocation,
  isScope,
  isClassProperty,
  isFunctionExpression,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isCallExpression,
  isThisExpression,
  isVariableDeclarator,
  isObjectExpression,
  isAssignmentExpression,
  isReturnStatement,
  isTSInterfaceDeclaration,
} from "@babel/types";

import traverse, {type NodePath} from "@babel/traverse";
import extract from "../extract";
import {parserLogger, tag} from "../Logger";
import {extractExtends, extractImplements, extractParams} from "./extract-metadata";
import parseBabel from "./parse-babel";
import extractSymbol from "./extract-symbol";

import {
  type Symbol, PASS_THROUGH, VIRTUAL, OBLIGATE_LEAF, isVirtual, isObligateLeaf} from "./symbol";

// ------------------------------------------------------------------------------------------------
// Helpers for resolving information related to Babel AST nodes
// ------------------------------------------------------------------------------------------------

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

// Helper to resolve assignment to object chain, e.g. [Class.prototype].property
function resolveObject(expression: MemberExpression): void {
  if (isThisExpression(expression.object)) {
    return "this";
  }

  let longname = "";
  expression = expression.object;

  while (expression.object) {
    longname = expression.property.name + "." + longname;
    expression = expression.object;
  }

  longname = expression.name + (longname ? "." : "") + longname;

  return longname;
}

// Whether the member expression assigns to this, e.g.
// this.member.inside.deep -> true
// top.inside -> false
function isInstancePropertyAssignment(expr: MemberExpression): boolean {
  if (isThisExpression(expr.object)) {
    return true;
  }
  if (isMemberExpression(expr.object)) {
    return isInstancePropertyAssignment(expr.object);
  }

  return false;
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
    symbol.flags = flags ? flags | pair.flags : pair.flags;
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
  logRecursive(sym: Symbol, prefix = ""): void {
    parserLogger.info("Debug", prefix + (sym.name || "-no-name-") + " " + sym.flags +
      ` [${sym.meta ? sym.meta.type : "-no-meta-"}]`);

    for (let i = 0; i < sym.children.length; i++) {
      SymbolUtils.logRecursive(sym.children[i], prefix + "\t");
    }
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
      meta: {},
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
      meta: {},
    };
  },

};

// These vistiors kind of "fix" the leadingComments by moving them in front of the intended
// AST node.
const extraVistors = {
  // Move comments before variable-declaration to infront of the declared identifier if
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
export default function buildSymbolTree(file: string, fileName?: string = ""): Symbol {
  const moduleSymbol = SymbolUtils.createModuleSymbol();
  const ast = parseBabel(file, fileName);
  const ancestorStack = [moduleSymbol];

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

      // Don't waste time traversing in leaf symbols
      if (idoc && isObligateLeaf(idoc)) {
        nodePath.skip(node);
        return;
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

  // The only ancestor left should be the moduleSymbol-symbol.
  if (ancestorStack.length > 1) {
    console.error(ancestorStack);
    console.error(ancestorStack.map((symbol) =>
      symbol.name +
      `@{${symbol.comment}}[${symbol.node ? symbol.node.type : "Headless"}]`));
    throw new Error("@webdoc/parser failed to correctly finish the symbol-tree.");
  }

  // SymbolUtils.logRecursive(moduleSymbol);

  return moduleSymbol;
}

// Captures all the symbols documented near the given AST node, including itself. This includes
// leading, inner, and trailing comments. This symbols are attached to the symbol-tree by adding
// them as a child of parent.
//
// The returned symbol is the one backed by the AST node.
function captureSymbols(node: Node, parent: Symbol): ?Symbol {
  const symbolInfo = {};

  extractSymbol(node, parent, symbolInfo);

  let {
    name,
    flags,
    init,
    initComment,
    isInit,
    nodeSymbol,
  } = symbolInfo;

  let nodeDocIndex;

  //
  // Create the nodeSymbol & add it as a child to parent
  //

  if (initComment || (node.leadingComments && node.leadingComments.length > 0)) {
    if (!initComment) {
      nodeDocIndex = SymbolUtils.commentIndex(node.leadingComments);
    }
    const nodeDoc = typeof nodeDocIndex === "number" ? node.leadingComments[nodeDocIndex] : null;
    const comment = initComment || extract(nodeDoc) || "";

    const leadingComments = node.leadingComments || [];

    // Does user want to document as a property? Then remove PASS_THROUGH flag
    // "@member " with the space is required b/c of @memberof tag
    if ((flags & VIRTUAL) && comment.indexOf("@member ") >= 0) {
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

    // All other leading comments are considered headless
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

  //
  // Inner & trailing comments are also added as headless symbols
  //

  const innerComments = node.innerComments;
  const trailingComments = node.trailingComments;

  if (nodeSymbol && innerComments) {
    // Inner comments are treated as a child of the created nodeSymbol. It is expected that the
    // node is a scope & nodeSymbol will always exist if innerComments also exists.

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
    // Trailing comments re-occur if they "lead" a node afterward. SymbolUtils.addChild will
    // replace.

    // If node is a BlockStatement with no code inside it, then its trailing comments also contain
    // the trailing comments of the parent (not of the block-statement). This is bug in Babel
    // reported by SukantPal.
    //
    // Also, the inner comments are part of the trailingComments as well.
    //
    // https://github.com/babel/babel/issues/11469
    const is11469 = isBlockStatement(node) && node.body.length === 0;
    const isTrailing = (n: Node) => n.loc.end.line >= node.loc.end.line;

    trailingComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        const actualParent = is11469 && isTrailing(comment) ? parent.parent : parent;

        const tsym = SymbolUtils.createHeadlessSymbol(doc, comment.loc, actualParent);
        SymbolUtils.addChild(tsym, actualParent);
      }
    });
  }

  return nodeSymbol;
}
