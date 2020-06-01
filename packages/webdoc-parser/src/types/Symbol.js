// @flow

import type {Node, SourceLocation} from "@babel/types";
import type {DocType, Param, Return} from "@webdoc/types";

// Ignore symbol when building doc-tree
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
  access?: string,
  dataType?: string,
  extends?: string[],
  implements?: string[],
  params?: Param[],
  returns?: Return[],
  scope?: string,
  type?: DocType,
  undocumented?: boolean
}

// This is a preliminary data-format that represents a documentable symbol.
//
// + Symbols with no associated AST node are said to be "headless". They are back solely by
// documentation comments.
export type Symbol = {
  node: ?Node,
  name: string,
  flags: number,
  path: string[],
  comment: string,
  parent: ?Symbol,
  members: Symbol[],
  loc: SourceLocation,
  meta: SymbolSignature
};

export function isPassThrough(symbol: Symbol): boolean {
  return symbol.flags & PASS_THROUGH;
}

export function isObligateLeaf(symbol: Symbol): boolean {
  return symbol.flags & OBLIGATE_LEAF;
}

export function isVirtual(symbol: Symbol): boolean {
  return symbol.flags & VIRTUAL;
}
