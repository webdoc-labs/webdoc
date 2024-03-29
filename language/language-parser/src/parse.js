// @flow

import * as Indexer from "./indexer";
import type {LanguageConfig, Symbol} from "@webdoc/language-library";
import type {RootDoc, SourceFile} from "@webdoc/types";
import {createPackageDoc, createRootDoc} from "@webdoc/model";
import assemble from "./assembler";
import mod from "./transformer/document-tree-modifiers";
import transform from "./transformer";

declare var Webdoc: any;

// Default language-config for parsing documentation
const DEFAULT_LANG_CONFIG: LanguageConfig = {
  reportUndocumented: false,
};

// $FlowFixMe
if (!global.Webdoc) {
  // $FlowFixMe
  global.Webdoc = {};
}

// $FlowFixMe
global.Webdoc.DEFAULT_LANG_CONFIG = DEFAULT_LANG_CONFIG;

// Used when you want to parse all the symbols in the code. This includes unit-testing.
export function applyDefaultLangConfig(cfg: LanguageConfig) {
  // $FlowFixMe
  global.Webdoc.DEFAULT_LANG_CONFIG = cfg;
}

export function buildSymbolTree(
  file: string,
  source?: SourceFile | string,
  config: LanguageConfig = Webdoc.DEFAULT_LANG_CONFIG,
): Symbol {
  if (typeof source === "undefined") {
    source = ".js";
  }
  if (typeof source === "string") {
    source = {
      path: source,
      package: {
        id: "id-virtual-root",
        api: [],
        name: "",
        path: "",
        stack: [],
        location: "",
        metadata: {},
        members: [],
        type: "PackageDoc",
      },
    };
  }

  return Indexer.process(file, source, config);
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
 * @param {string | SourceFile[]} target
 * @param {RootDoc} root
 * @param {object}[options]
 * @param {boolean}[options.mainThread] - Force the indexer to run on the main thread.
 * @return {RootDoc}
 */
export async function parse(
  target: string | SourceFile[],
  root: RootDoc = createRootDoc(),
  options?: $Shape<{
    mainThread: boolean
  }>,
): Promise<RootDoc> {
  if (typeof target === "string") {
    target = [{
      content: target,
      path: ".js",
      package: createPackageDoc(),
    }];
  }

  const perFileSymbolTrees = await Indexer.run(target, Webdoc.DEFAULT_LANG_CONFIG, options);
  const fullSymbolTree = assemble(perFileSymbolTrees);

  root.children = root.members;

  transform(fullSymbolTree, root);
  mod(root);

  return root;
}
