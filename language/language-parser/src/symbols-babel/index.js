// @flow

// This file provides langJS and langTS integration, both of which use Babel to generate
// symbols trees. These are registered in parse.js!

import type {LanguageConfig, LanguageIntegration} from "../types/LanguageIntegration";
import type {SourceFile} from "@webdoc/types";
import type {Symbol} from "../types/Symbol";
import buildSymbolTree from "./build-symbol-tree";
import {mode} from "./extract-metadata";

// Plugins for plain JavaScript files
const defaultPreset = [
  "asyncGenerators",
  "bigInt",
  "classPrivateMethods",
  "classPrivateProperties",
  "classProperties",
  ["decorators", {decoratorsBeforeExport: true}],
  "doExpressions",
  "dynamicImport",
  "exportDefaultFrom",
  "functionBind",
  "functionSent",
  "importMeta",
  "jsx",
  "logicalAssignment",
  "nullishCoalescingOperator",
  "numericSeparator",
  "objectRestSpread",
  "optionalCatchBinding",
  "optionalChaining",
  "throwExpressions",
];

// Plugins for JS+Flow files
const flowPreset = [
  ...defaultPreset,
  "flow",
  "flowComments",
];

// Plugins for TypeScript files
const tsPreset = [
  ...defaultPreset,
  "typescript",
];

export const langJS: LanguageIntegration = {
  extensions: ["js", "jsx", "jsdoc"],
  module: "@webdoc/parser/lib/symbols-babel/langJS",
  parse(file: string, source: SourceFile, config: LanguageConfig): Symbol {
    mode.current = "flow";

    // Flow is automatically handled!
    return buildSymbolTree(file, source, config, flowPreset);
  },
};

export const langTS: LanguageIntegration = {
  extensions: ["ts", "tsx"],
  module: "@webdoc/parser/lib/symbols-babel/langTS",
  parse(file: string, source: SourceFile, config: LanguageConfig): Symbol {
    mode.current = "typescript";

    return buildSymbolTree(file, source, config, tsPreset);
  },
};
