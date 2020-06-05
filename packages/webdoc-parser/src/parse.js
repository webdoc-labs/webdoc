// @flow
/* global Webdoc */

import mod from "./doctree-mods";
import {parserLogger} from "./Logger";
import type {RootDoc} from "@webdoc/types";
import {langJS, langTS} from "./symbols-babel";
import type {Symbol} from "./types/Symbol";
import type {LanguageIntegration, LanguageConfig} from "./types/LanguageIntegration";

import assemble from "./assembler";
import transform from "./transformer";

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

// Default language-config for parsing documentation
const DEFAULT_LANG_CONFIG: LanguageIntegration = {
  reportUndocumented: false,
};

if (!global.Webdoc) {
  global.Webdoc = {};
}

global.Webdoc.DEFAULT_LANG_CONFIG = DEFAULT_LANG_CONFIG;

// Used when you want to parse all the symbols in the code. This includes unit-testing.
export function applyDefaultLangConfig(cfg: LanguageConfig) {
  global.Webdoc.DEFAULT_LANG_CONFIG = cfg;
}

export function buildSymbolTree(
  file: string,
  fileName ?: string = ".js",
  config: LanguageConfig = Webdoc.DEFAULT_LANG_CONFIG,
): Symbol {
  const lang = languages[fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)];

  if (!lang) {
    throw new Error(`.${lang} file language is not registered`);
  }

  return lang.parse(file, config);
}

// TODO: Asynchronous API for parsing

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

  const rsym = assemble(partialDoctrees);

  root.children = root.members;
  transform(rsym, root);

  mod(root);

  return root;
}
