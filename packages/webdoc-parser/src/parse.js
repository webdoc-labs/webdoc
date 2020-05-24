// @flow

import buildSymbolTree, {type Symbol} from "./build-symbol-tree";
import buildDoc from "./build-doc";
import mod from "./doctree-mods";
import {parserLogger} from "./Logger";
import type {RootDoc, Doc} from "@webdoc/types";
import {addChildDoc} from "@webdoc/model";

function assemble(symbol: Symbol, root: RootDoc): void {
  // buildDoc will *destroy* everything in symbol, so store things needed beforehand
  const name = symbol.name;
  const children = symbol.children;
  const parent = symbol.parent;// :Doc (not a symbol because assemble() was called on parent!!!)

  const doc: Doc = buildDoc(symbol);

  if (!doc && name !== "File") {
    parserLogger.error("DocParser",
      `Couldn't parse doc for + ${symbol.name}(@${symbol.path.join(".")})`);
    return;
  } else if (doc) {
    doc.members = doc.children;
  }

  if (doc && doc.name === undefined) {
    console.log(Object.assign({}, doc, {node: "removed"}));
    console.log("^^^ ERR");
  }

  if (parent && parent.name !== "File") {
    addChildDoc(doc, parent);
  } else if (symbol.name !== "File") {
    addChildDoc(doc, root);
  }

  if (children) {
    for (let i = 0; i < children.length; i++) {
      assemble(children[i], root);
    }
  }
}

/**
 * Parses the file(s) into a doc-tree. This consists of the following phases:
 *
 * * Capture Phase: Documentation comments are extracted out of each file and assembled into
 *     a temporary list of partial-doc trees.
 * * Transform Phase: Each file's partial-doc tree is transformed into docs and assembled in
 *     monolithic doc-tree.
 * * Mod Phase: The "@memberof" tag is handled by moving docs to their final path;
 *     <this> member docs are moved to the appropriate scope.
 *     Plugins are allowed access to make any post-transform changes as well. Undocumented entities
 *     are removed from the doc-tree.
 *
 * @param {string | string[]} target
 * @param {RootDoc} root
 * @return {RootDoc}
 */
export function parse(target: string | string[] | Map<string, string>, root?: RootDoc = {
  children: [],
  path: "",
  stack: [""],
  type: "RootDoc",
  tags: [],
}): RootDoc {
  if (typeof target === "string") {
    target = [target];
  }

  const partialDoctrees = new Array(Array.isArray(target) ? target.length : target.size);

  // TODO: Don't do two loops, it sucks for performance

  // Build a symbol-tree for all the files
  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      partialDoctrees[i] = buildSymbolTree(target[i]);
    }
  } else {
    let i = 0;

    for (const [fileName, file] of target) {
      partialDoctrees[i] = buildSymbolTree(file, fileName);
      ++i;
    }
  }

  // Recursively transform & assemble into the doc-tree (root).
  for (let i = 0; i < partialDoctrees.length; i++) {
    assemble(partialDoctrees[i], root);
  }

  mod(root);

  return root;
}
