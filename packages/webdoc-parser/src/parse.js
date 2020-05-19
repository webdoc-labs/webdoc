// @flow

import buildSymbolTree from "./build-symbol-tree";
import buildDoc from "./build-doc";
import mod from "./doctree-mods";
import {parserLogger} from "./Logger";
import type {RootDoc, Doc} from "@webdoc/types";
import {addChildDoc} from "@webdoc/model";

function assemble(symbol: Symbol, root: RootDoc): void {
  const doc: Doc = buildDoc(symbol);

  if (!doc && symbol.name !== "File") {
    symbol.parent = null;
    parserLogger.error("DocParser",
      `Couldn't parse doc for + ${symbol.name}(@${symbol.path.join(".")})`);

    if (!symbol.node) {
      console.log(symbol.comment);
    }

    return;
  } else if (doc) {
    doc.members = doc.children;
  }

  const parent = symbol.parent ? symbol.parent.doc : null;

  if (doc && doc.name === undefined) {
    console.log(Object.assign({}, doc, {node: "removed"}));
    console.log("^^^ ERR");
  }

  if (parent && !doc.constructor.noInferredScope) {
    addChildDoc(doc, parent);
  } else if (symbol.name !== "File") {
    addChildDoc(doc, root);
  }

  symbol.doc = doc;

  if (symbol.children) {
    const children = symbol.children;

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
export function parse(target: string | string[], root?: RootDoc = {
  children: [],
  path: "",
  stack: [""],
  type: "RootDoc",
  tags: [],
}): RootDoc {
  const files = Array.isArray(target) ? target : [target];
  const partialDoctrees = new Array(files.length);

  // TODO: Don't do two loops, it sucks for performance

  // Capture all files
  for (let i = 0; i < files.length; i++) {
    partialDoctrees[i] = buildSymbolTree(files[i]);
  }

  // Recursively transform & assemble into the doc-tree (root).
  for (let i = 0; i < partialDoctrees.length; i++) {
    assemble(partialDoctrees[i], root);
  }

  mod(root);

  return root;
}
