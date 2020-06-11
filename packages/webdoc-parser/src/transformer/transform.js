// @flow

import {type Doc, type RootDoc} from "@webdoc/types";
import {parserLogger, tag} from "../Logger";
import {type Symbol} from "../types/Symbol";
import {addChildDoc} from "@webdoc/model";
import symbolToDoc from "./symbol-to-doc";

// This file provides the transformation from a symbol-metadata tree into a documentation tree.

export function transformRecursive(symbol: Symbol, root: RootDoc): Doc {
  // transform will *destroy* everything in symbol, so store things needed beforehand
  const members = symbol.members;
  const parent = symbol.parent;// :Doc (not a symbol because assemble() was called on parent!!!)

  const doc: Doc = symbolToDoc(symbol);

  if (!doc && !symbol.isRoot) {
    parserLogger.error(tag.DocParser,
      `Failed to parse doc for ${symbol.simpleName}(@${symbol.canonicalName || "Unnamed"})` +
      `{@${symbol.loc.fileName}` +
      `<${symbol.start ? symbol.start.line : "NaN"},` +
      ` ${symbol.start ? symbol.start.column : "NaN"}>}`);
    return;
  }

  // TODO: Maybe we don't want to ignore file symbols
  if (parent && !parent.isRoot) {
    addChildDoc(doc, parent);
  } else if (!symbol.isRoot) {
    addChildDoc(doc, root);
  }

  if (members) {
    for (let i = 0; i < members.length; i++) {
      transformRecursive(members[i], root);
    }
  }
}
