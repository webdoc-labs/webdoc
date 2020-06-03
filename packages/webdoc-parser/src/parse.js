// @flow

import buildDoc from "./build-doc";
import mod from "./doctree-mods";
import {parserLogger} from "./Logger";
import type {RootDoc, Doc} from "@webdoc/types";
import {addChildDoc} from "@webdoc/model";

import {langJS, langTS} from "./symbols-babel";

import type {Symbol} from "./types/Symbol";
import type {LanguageIntegration} from "./types/LanguageIntegration";

// File-extension -> LanguageIntegration mapping
const languages: { [id: string]: LanguageIntegration } = {};

// Register a language-integration that will be used to generate a symbol-tree for files with its
// file-extensions.
export function registerLanguage(lang: LanguageIntegration): void {
  for (const ext of lang.extensions) {
    if (languages[ext]) {
      parserLogger.warn("LanguageIntegration",
        `.${ext} file extension has already been registered`);
    }

    languages[ext] = lang;
  }
}

// Register built-in languages
registerLanguage(langJS);
registerLanguage(langTS);

export function buildSymbolTree(file: string, fileName ?: string = ".js"): Symbol {
  const lang = languages[fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)];

  if (!lang) {
    throw new Error(`.${lang} file language is not registered`);
  }

  return lang.parse(file);
}

function assemble(symbol: Symbol, root: RootDoc): void {
  // buildDoc will *destroy* everything in symbol, so store things needed beforehand
  const name = symbol.simpleName;
  const members = symbol.members;
  const parent = symbol.parent;// :Doc (not a symbol because assemble() was called on parent!!!)

  const doc: Doc = buildDoc(symbol);

  if (!doc && name !== "File") {
    parserLogger.error("DocParser",
      `Couldn't parse doc for + ${symbol.name}(@${symbol.path.join(".")})`);
    return;
  }

  if (doc && doc.name === undefined) {
    console.log(Object.assign({}, doc, {node: "removed"}));
    console.log("^^^ ERR");
  }

  if (parent && parent.simpleName !== "File") {
    addChildDoc(doc, parent);
  } else if (symbol.simpleName !== "File") {
    addChildDoc(doc, root);
  }

  if (members) {
    for (let i = 0; i < members.length; i++) {
      assemble(members[i], root);
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
  members: [],
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
