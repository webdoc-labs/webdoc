// @flow

import {type AssemblyModifier} from "../types/AssemblyModifier";
import {type Symbol} from "../types/Symbol";

/**
 * Assembles the symbol-metadata trees of each source-file into one, monolithic tree.
 *
 * @param {Symbol[]} modules - the root node of each source-file's symbol-metadata tree
 * @return {Symbol} - the root node of the assembled symbol-metadata tree
 */
export function assemble(modules: Symbol[]): Symbol {
  const rootSymbol = {
    name: "",
    flags: 0,
    path: [""],
    members: modules,
    loc: {start: {}, end: {}},
    meta: {
      type: "RootDoc",
    },
  };
}
