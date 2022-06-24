// @flow

import type {DataType, DocType, Param, Return, SourceFile} from "@webdoc/types";
import {parserLogger, tag} from "../Logger";
import {CANONICAL_DELIMITER} from "../constants";
import type {Node} from "@babel/types";
import _ from "lodash";

// Ignore symbol when building document-tree
export const PASS_THROUGH = 1 << 0;

// Any members must be ignored and not be included in the doc-tree. These are usually skipped
// in the AST as well. (For example, properties/variables initialized to some value)
export const OBLIGATE_LEAF = 1 << 1;

// Symbol is "virtual" & created by the generator for its own purpose. These symbols are not
// reported to the SymbolParser!
export const VIRTUAL = 1 << 2;

// The meta-data associated with a symbol's signature. This is used by build-doc to infer
// information that is not explicity documented and/or verify the documented information
// is correct.
export type SymbolSignature = {
  abstract?: boolean,
  access?: ?string,
  constant?: ?boolean,
  dataType?: ?DataType,
  defaultValue?: ?string,
  extends?: ?Array<string | Symbol>,
  implements?: ?Array<string | Symbol>,
  object?: ?string,
  params?: ?Array<$Shape<Param>>,
  readonly?: boolean,
  returns?: ?Array<$Shape<Return>>,
  scope?: ?string,
  value?: ?string,
  type?: ?DocType,
  typeParameters?: ?Array<string>,
  undocumented?: boolean,
  undocumentedAnchored?: boolean, // Prevent pruning of symbol if parent is retained
}

// The location of a symbol
export type SymbolLocation = {
  start: { line: number, column: number },
  end: { line: number, column: number },
  fileName?: string,
  file?: SourceFile
}

// This is a preliminary data-format that represents a documentable symbol.
//
// + Symbols with no associated AST node are said to be "headless". They are back solely by
// documentation comments.
export type Symbol = {
  node?: ?Node,
  simpleName: string,
  canonicalName: string,
  flags: number,
  path: string[],
  comment: string,
  parent?: ?Symbol,
  members: Symbol[],
  loc: SymbolLocation,
  meta: SymbolSignature,
  isRoot?: boolean,

  // This flags symbols that are the initializer of a parent. They are merged when another symbol
  // with the same name is found.
  __INITOR__?: ?boolean,
  __INIT__?: ?boolean
};

export function isPassThrough(symbol: Symbol): boolean {
  return !!(symbol.flags & PASS_THROUGH);
}

export function isObligateLeaf(symbol: Symbol): boolean {
  return !!(symbol.flags & OBLIGATE_LEAF);
}

export function isVirtual(symbol: Symbol): boolean {
  return !!(symbol.flags & VIRTUAL);
}

// Find the symbol with the given canonicalName w.r.t the rootSymbol.
//
// depth is an internal parameter, and not intended for external use.
export function findSymbol(
  canonicalName: string | string[],
  rootSymbol: Symbol,
  depth: number = 0,
): ?Symbol {
  if (typeof canonicalName === "string") {
    canonicalName = canonicalName.split(CANONICAL_DELIMITER);
  }

  const searchName = canonicalName[depth];
  const searchSymbols = rootSymbol.members;

  for (let i = 0; i < searchSymbols.length; i++) {
    if (searchSymbols[i].simpleName === searchName) {
      if (depth === canonicalName.length - 1) {
        return searchSymbols[i];
      }

      return findSymbol(canonicalName, searchSymbols[i], depth + 1);
    }
  }

  return null;
}

// Finds the symbol accessed at a given location (at refereeSymbol) by the given name. This may be
// different than the symbol whose canonicalName is referredName. For example,
//
// function doSomething() {}
//
// function makeClass() {
//   class doSomething {}
//
//   doSomething.staticProperty = "dataValue";
//   ^^^^^^^^^^^
//   return doSomething
// }
//
// The underlined doSomething's canonicalName is actually makeClass~doSomething, while it is
// referred to by doSomething (by staticProperty symbol's metadata.object field).
export function findAccessedSymbol(
  referredName: string | string[],
  refereeSymbol: Symbol,
): ?Symbol {
  if (typeof referredName === "string") {
    referredName = referredName.split(CANONICAL_DELIMITER);
  }

  const searchName = referredName[0];

  if (refereeSymbol.parent) {
    const parent = refereeSymbol.parent;

    for (let i = 0; i < parent.members.length; i++) {
      if (parent.members[i].simpleName === searchName) {
        if (referredName.length > 1) {
          // Go down this symbol to get the referred symbol
          return findSymbol(referredName.slice(1), parent.members[i]);
        } else {
          return parent.members[i];
        }
      }
    }

    // Search upward if nothing is found inside parent
    return findAccessedSymbol(referredName, parent);
  }

  return null;
}

// Adds "symbol" as a child to "parent", possibly merging it with an existing symbol. The
// returned symbol need not be the same as "symbol".
export function addChildSymbol(doc: Symbol, scope: Symbol): Symbol {
  if (doc.parent) {
    if (doc.parent === scope) {
      // Don't trick us :-)
      return doc;
    }

    removeChildSymbol(doc);
  }

  const {members} = scope;
  let index = -1;

  // Replace symbols when it has the same location but a different node. This occurs
  // when the Node for a comment is found (the symbol being replaced was headless).
  for (let i = 0; i < scope.members.length; i++) {
    const child = members[i];

    if (child.simpleName && child.simpleName === doc.simpleName) {
      // __INITOR__ means that a merging was actually expected
      if (child.meta.undocumented || doc.meta.undocumented || child.__INITOR__ || doc.__INITOR__) {
        // Merge undocumented symbol into documented one. This is helpful for
        // inference.
        //
        // However, if both symbols are documented, they may be overloads.
        return coalescePair(child, doc);
      }
    }
    if (areEqualLoc(child, doc)) {
      coalescePair(child, doc);
      doc = child;
      index = i;
      break;
    }
  }

  // Coalesce Symbols when they refer to the same Node with different names
  if (index === -1 && doc.node && !isVirtual(doc)) {
    for (let i = 0; i < scope.members.length; i++) {
      const child = members[i];

      if (child === doc) {
        parserLogger.error(tag.PartialParser, "Same partial doc being added twice");
      }
      if (child.node === doc.node) {
        child.comment += `\n\n${doc.comment}`;
        child.members.push(...doc.members);
        return child;
      }
    }
  }

  // Append if new child symbol
  if (index === -1) {
    members.push(doc);
  }

  //  if (!isVirtual(doc)) {
  doc.parent = scope;
  doc.canonicalName = scope.canonicalName ?
    scope.canonicalName + "." + doc.simpleName :
    doc.simpleName;
  doc.path = [...scope.path, doc.simpleName];
  //  } else {
  //    doc.parent = scope;
  //    doc.path = [...scope.path];
  //  }

  return doc;
}

// Remove a child from its parent
export function removeChildSymbol(symbol: Symbol): ?Symbol {
  const parentSymbol = symbol.parent;

  if (!parentSymbol) {
    return symbol;
  }

  const memberIndex = parentSymbol.members.indexOf(symbol);

  if (memberIndex >= 0) {
    parentSymbol.members.splice(memberIndex, 1);
  } else {
    console.error("Malformed parent-child relationship - child not found [in " +
      symbol.canonicalName + "]");
  }

  symbol.parent = null;
  symbol.canonicalName = symbol.simpleName;
  symbol.path = [symbol.simpleName];
}

// Coalesce "pair" into "symbol" because they refer to the same symbol (by name)
export function coalescePair(symbol: Symbol, pair: Symbol): Symbol {
  const members = symbol.members;
  const comment = symbol.comment;
  const flags = symbol.flags;

  symbol.members.push(...pair.members);

  symbol.comment = comment || pair.comment;
  symbol.members = members;
  symbol.flags = flags ? flags | pair.flags : pair.flags;
  // $FlowFixMe
  symbol.meta = _.assignWith(symbol.meta, pair.meta, (objValue, srcValue) =>
    _.isNil(srcValue) ? objValue : srcValue);
  symbol.loc = symbol.loc || pair.loc;
  symbol.simpleName = symbol.simpleName || pair.simpleName;

  symbol.meta.undocumented = !symbol.comment;

  // It is **important** give the second pair high precedence. Otherwise, the AST traversal
  // may fail to exit the pair's node.
  symbol.node = pair.node || symbol.node;

  // Horizontal transfer of members
  for (let i = 0; i < pair.members.length; i++) {
    pair.members[i].parent = symbol;
  }

  return symbol;
}

export function printSourceLocation(symbol: Symbol): string {
  return `(in ${symbol.loc.fileName ?? "an unknown file"} at ` +
    `${symbol.loc.start ? symbol.loc.start.line : "NaN"}:` +
    `${symbol.loc.start ? symbol.loc.start.column : "NaN"})`;
}

function areEqualLoc(doc1: Symbol, doc2: Symbol): boolean {
  return doc1.loc.fileName === doc2.loc.fileName &&
    doc1.loc.start && doc2.loc.start &&
    doc1.loc.start.line === doc2.loc.start.line &&
    doc1.loc.start.column === doc2.loc.start.column;
}
