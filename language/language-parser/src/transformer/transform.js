// @flow

import {type Doc, type RootDoc} from "@webdoc/types";
import {type Symbol, printSourceLocation} from "@webdoc/language-library";
import {parserLogger, tag} from "../Logger";
import {addChildDoc} from "@webdoc/model";
import symbolToDoc from "./symbol-to-doc";

// This file provides the transformation from a symbol-metadata tree into a documentation tree.

export function transformRecursive(symbol: Symbol, root: RootDoc): ?Doc {
  // transform will *destroy* everything in symbol, so store things needed beforehand
  const members = symbol.members;
  const parent = symbol.parent;// :Doc (not a symbol because assemble() was called on parent!!!)

  const doc = symbolToDoc(symbol);

  if (!doc && !symbol.isRoot) {
    parserLogger.error(tag.DocParser,
      `Failed to parse doc for ${symbol.simpleName}(@${symbol.canonicalName || "Unnamed"})` +
     printSourceLocation(symbol));
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
