// @flow

import {type Symbol} from "../types/Symbol";
import {type Doc, type RootDoc} from "@webdoc/types";
import {addChildDoc} from "@webdoc/model";
import {buildDoc as transform} from "../build-doc";
import {parserLogger} from "../Logger";

// This file provides the transformation from a symbol-metadata tree into a documentation tree.

// TODO: Make the simpleName="File" case clearer

export function transformRecursive(symbol: Symbol, root: RootDoc): Doc {
  // transform will *destroy* everything in symbol, so store things needed beforehand
  const name = symbol.simpleName;
  const members = symbol.members;
  const parent = symbol.parent;// :Doc (not a symbol because assemble() was called on parent!!!)

  const doc: Doc = transform(symbol);

  if (!doc && name !== "File") {
    parserLogger.error("DocParser",
      `Couldn't parse doc for + ${symbol.name}(@${symbol.path.join(".")})`);
    return;
  }

  if (parent && parent.simpleName !== "File") {
    addChildDoc(doc, parent);
  } else if (symbol.simpleName !== "File") {
    addChildDoc(doc, root);
  }

  if (members) {
    for (let i = 0; i < members.length; i++) {
      transform(members[i], root);
    }
  }
}
