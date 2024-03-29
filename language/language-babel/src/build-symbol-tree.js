// @flow

// This file implements the construction of a symbol-tree for JavaScript/Flow/TypeScript code.

import * as parser from "@babel/parser";
import {
  type ArrayPattern,
  type ArrowFunctionExpression,
  type Comment,
  type CommentBlock,
  type FunctionDeclaration,
  type FunctionExpression,
  type Node,
  type ObjectPattern,
  SourceLocation,
  type VariableDeclaration,
  isArrayPattern,
  isArrowFunctionExpression,
  isBlockStatement,
  isClassMethod,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isObjectMethod,
  isObjectPattern,
  isRestElement,
  isScope,
  isTSParameterProperty,
  isVariableDeclaration,
} from "@babel/types";
import {
  type Symbol,
  type SymbolLocation,
  VIRTUAL,
  addChildSymbol,
  isObligateLeaf,
  isVirtual,
} from "@webdoc/language-library";
import {
  clearRegistry,
  createBlock,
  declareParameter,
  declareVariable,
  removeBlock,
} from "./variable-registry";

import {log, tag} from "@webdoc/language-library";
import traverse, {type NodePath} from "@babel/traverse";
import type {LanguageConfig} from "@webdoc/language-library";
import type {SourceFile} from "@webdoc/types";
import extract from "./extract";
import {extractParams} from "./extract-metadata";
import extractSymbol from "./extract-symbol";

// TODO: This shouldn't really be a part of symbols-babel but rather should live with Symbol.js
// in SymbolUtils.js
// Exported for testing in test/build-symbol-tree.test.js
export const SymbolUtils = {
  addChild: addChildSymbol,
  commentIndex(comments: CommentBlock[]): number {
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].value.startsWith("*") || comments[i].value.startsWith("!")) {
        return i;
      }
    }

    // Just try the leading comment
    return comments.length - 1;
  },
  logRecursive(sym: Symbol, prefix: string = ""): void {
    log.info("Debug", prefix + (sym.simpleName || "-no-name-") + " " + sym.flags +
      ` [${sym.meta && sym.meta.type ? sym.meta.type : "-no-meta-"}]`);

    for (let i = 0; i < sym.members.length; i++) {
      SymbolUtils.logRecursive(sym.members[i], prefix + "\t");
    }
  },
  createModuleSymbol(): Symbol {
    return {
      node: null,
      simpleName: "File",
      flags: 0,
      path: [],
      comment: "",
      canonicalName: "",
      parent: null,
      members: [],
      loc: _createLoc(),
      meta: {},
    };
  },
  createHeadlessSymbol(comment: string, loc: SourceLocation): Symbol {
    return {
      node: null,
      simpleName: "",
      canonicalName: "",
      flags: 0,
      comment,
      members: [],
      loc: _createLoc(loc),
      meta: {},
      path: [],
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

let fileName = "";
let sourceFile: SourceFile;
let reportUndocumented = false;

// Parses the file and returns a tree of symbols
export default function buildSymbolTree(
  file: string,
  source: SourceFile,
  config: LanguageConfig,
  plugins: Array<string | [string, any]>,
): Symbol {
  const moduleSymbol = SymbolUtils.createModuleSymbol();
  let ast;

  fileName = source.path;
  sourceFile = source;
  reportUndocumented = config.reportUndocumented;
  clearRegistry();

  try {
    ast = parser.parse(file, {
      plugins,
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (e) {
    console.error(`Babel couldn't parse file in @webdoc/parser (${fileName})`);
    throw e;
  }

  const ancestorStack = [moduleSymbol];

  // File-level scope
  createBlock();

  traverse(ast, {
    enter(nodePath: NodePath) {
      createBlock();

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
        idoc = captureSymbols(nodePath, scope);
      } catch (e) {
        console.error(ancestorStack);
        console.log(node);
        console.error(ancestorStack.map((symbol) =>
          symbol.simpleName +
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
      removeBlock();

      const currentPardoc = ancestorStack[ancestorStack.length - 1];

      if (currentPardoc && currentPardoc.node === nodePath.node) {
        ancestorStack.pop();

        // Delete PASS_THROUGH flagged partial-docs & lift up their members.
        if (isVirtual(currentPardoc)) {
          const parentPardoc: Symbol = (currentPardoc.parent: any);

          parentPardoc.members.splice(parentPardoc.members.indexOf(currentPardoc), 1);
          // parentPardoc.members.push(...currentPardoc.members);

          for (let i = 0; i < currentPardoc.members.length; i++) {
            currentPardoc.members[i].parent = null;
            SymbolUtils.addChild(currentPardoc.members[i], parentPardoc);
            // currentPardoc.members[i].parent = parentPardoc;
          }
        }
      }
    },
  });

  // The only ancestor left should be the moduleSymbol-symbol.
  if (ancestorStack.length > 1) {
    console.error(ancestorStack);
    console.error(ancestorStack.map((symbol) =>
      symbol.simpleName +
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
function captureSymbols(nodePath: NodePath, parent: Symbol): ?Symbol {
  const node = nodePath.node;
  const symbolInfo = {};

  extractSymbol(nodePath, parent, symbolInfo);

  let {
    name: simpleName,
    flags,
    init,
    initComment,
    isInit,
    nodeSymbol,
  } = symbolInfo;

  if (nodeSymbol.meta.params) {
    const params = nodeSymbol.meta.params;

    for (let i = 0, j = params.length; i < j; i++) {
      declareParameter(params[i].identifier);
    }

    if (params.flawed) {
      console.error(tag.Indexer, "^^^ Errors in parsing a parameter near " +
        fileName + ":" + (node && node.start ? node.start.line : "?"));
    }
  } else if (node.params) {
    registerParameters(node);
  }

  if (isVariableDeclaration(node)) {
    registerDeclaredVariables(node);
  }

  let nodeDocIndex;

  //
  // Create the nodeSymbol & add it as a child to parent
  //

  const leadingComments = filterComments(node.leadingComments) || [];

  // leadingComments -> documented
  // isScope -> children may be documented even if node is not
  // TSParameterProperty -> They don't have doc-comments but the @param tag for the parameter
  //  covers it so we always include them.
  if (
    leadingComments.length ||
    isScope(node) ||
    isTSParameterProperty(node) ||
    reportUndocumented
  ) {
    if (!initComment && leadingComments.length && simpleName) {
      nodeDocIndex = SymbolUtils.commentIndex(leadingComments);
    }
    const nodeDoc = typeof nodeDocIndex === "number" ? leadingComments[nodeDocIndex] : null;
    const comment = (initComment ? initComment : (nodeDoc ? extract(nodeDoc) : "")) || "";

    if (!comment) {
      nodeSymbol.meta.undocumented = true;

      if (isTSParameterProperty(node)) {
        nodeSymbol.meta.undocumentedAnchored = true;
      }
    }

    // Does user want to document as a property? Then remove VIRTUAL flag
    // "@member " with the space is required b/c of @memberof tag
    if ((flags & VIRTUAL) && comment.indexOf("@member ") >= 0) {
      flags &= ~VIRTUAL;
    }

    if (simpleName && ((flags & VIRTUAL) === 0)) {
      nodeSymbol = Object.assign({
        node,
        simpleName,
        flags,
        path: [...parent.path, simpleName],
        comment,
        members: [],
        loc: _createLoc(
          nodeDoc ? nodeDoc.loc :
            node.loc ? node.loc : // Needed for undocumented symbols
              null,
        ),
      }, nodeSymbol);

      nodeSymbol = SymbolUtils.addChild(nodeSymbol, parent);
    } else if (simpleName && isInit) {
      nodeSymbol = Object.assign({
        node,
        simpleName: "",
        canonicalName: parent.canonicalName,
        flags,
        comment: "",
        path: [...parent.path],
        members: [{
          node: init,
          simpleName,
          flags: 0,
          comment,
          members: [],
          canonicalName: parent.canonicalName + "." + simpleName,
          path: [...parent.path, simpleName],
          loc: _createLoc(nodeDoc ? nodeDoc.loc : null),
          options: {
            object: node.expression ? node.expression.left.object.name : undefined,
          },
          meta: {
            ...nodeSymbol.meta,
          },
          __INITOR__: true,
        }],
        loc: _createLoc(nodeDoc ? nodeDoc.loc : null),
        virtual: true,
      }, nodeSymbol);

      nodeSymbol = SymbolUtils.addChild(nodeSymbol, parent);
      nodeSymbol.__INIT__ = true;
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
        SymbolUtils.createHeadlessSymbol(comment, leadingComments[i].loc),
        parent);
    }
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

    // Alias
    const ns = nodeSymbol;

    innerComments.forEach((comment) => {
      const doc = extract(comment);

      if (doc) {
        // $FlowFixMe
        SymbolUtils.addChild(
          SymbolUtils.createHeadlessSymbol(doc, comment.loc),
          ns);
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
        const tsym = SymbolUtils.createHeadlessSymbol(doc, comment.loc);

        // $FlowFixMe
        SymbolUtils.addChild(tsym, actualParent);
      }
    });
  }

  return nodeSymbol;
}

const EMPTY_ARRAY = [];

function filterComments(
  // eslint-disable-next-line no-undef
  comments: $ReadOnlyArray<CommentBlock | Comment>,
): (CommentBlock | Comment)[] {
  return comments ?
    comments.filter((cnode) => {
      return (cnode.type === "CommentBlock") &&
       (cnode.value.startsWith("*") || cnode.value.startsWith("!"));
    }) :
    EMPTY_ARRAY;
}

function registerDeclaredVariables(node: VariableDeclaration): void {
  const declarations = node.declarations;

  for (let i = 0, j = declarations.length; i < j; i++) {
    const decl = declarations[i];

    if (isIdentifier(decl.id)) {
      declareVariable(declarations[i].id.name);
    } else if (isObjectPattern(decl.id)) {
      registerObjectPropertyVariables(decl.id);
    } else if (isArrayPattern(decl.id)) {
      registerArrayElementVariables(decl.id);
    }
  }
}

function registerObjectPropertyVariables(node: ObjectPattern): void {
  const props = node.properties;

  for (let i = 0, j = props.length; i < j; i++) {
    const prop = props[i];

    if (isRestElement(prop)) {
      continue;
    }

    if (!prop.key) {
      throw new Error("WTF");
    }

    declareVariable(prop.key.name);

    if (isObjectPattern(prop.value)) {
      registerObjectPropertyVariables(prop.value);
    } else if (isArrayPattern(prop.value)) {
      registerArrayElementVariables(prop.value);
    }
  }
}

function registerArrayElementVariables(node: ArrayPattern): void {
  const elems = node.elements;

  for (let i = 0, j = elems.length; i < j; i++) {
    const elem = elems[i];

    if (isIdentifier(elem)) {
      declareVariable(elem.name);
    } else if (isObjectPattern(elem)) {
      registerObjectPropertyVariables(elem);
    } else if (isArrayPattern(elem)) {
      registerArrayElementVariables(elem);
    }
  }
}

function registerParameters(
  node: FunctionDeclaration | FunctionExpression | ArrowFunctionExpression,
): void {
  if (!isFunctionExpression(node) &&
      !isArrowFunctionExpression(node) &&
      !isFunctionDeclaration(node) &&
      !isClassMethod(node) &&
      !isObjectMethod(node)) {
    return;
  }

  const params = extractParams(node);

  for (let i = 0, j = params.length; i < j; i++) {
    declareParameter(params[i].identifier);
  }
}

function _createLoc(loc?: SourceLocation): SymbolLocation {
  if (!loc) {
    return {
      fileName,
      file: sourceFile,
      start: {line: NaN, column: NaN},
      end: {line: NaN, column: NaN},
    };
  }

  return {
    fileName,
    file: sourceFile,
    start: {line: loc.start.line, column: loc.start.column},
    end: {line: loc.end.line, column: loc.end.column},
  };
}
