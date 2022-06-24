// @flow

import {type Symbol} from "@webdoc/language-library";
import modAssembly from "./assembly-modifiers";

/**
 * Assembles the symbol-metadata trees of each source-file into one, monolithic tree.
 *
 * @param {Symbol[]} modules - the root node of each source-file's symbol-metadata tree
 * @return {Symbol} - the root node of the assembled symbol-metadata tree
 */
export function assemble(modules: Symbol[]): Symbol {
  const rootSymbol = {
    simpleName: "",
    canonicalName: "",
    isRoot: true,
    flags: 0,
    comment: "",
    path: [""],
    members: [],
    loc: {
      start: {
        line: NaN,
        column: NaN,
      },
      end: {
        line: NaN,
        column: NaN,
      },
    },
    meta: {
      type: "RootDoc",
    },
  };

  modules.forEach((modl) => {
    rootSymbol.members.push(...modl.members);

    modl.members.forEach((mem) => {
      mem.parent = rootSymbol;
    });
  });

  modAssembly(rootSymbol);

  return rootSymbol;
}
