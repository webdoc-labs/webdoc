// @flow

import type {SourceFile} from "@webdoc/types";
import type {Symbol} from "./Symbol";

// Language-integration definition - used for parsing code into a symbol-tree
export type LanguageIntegration = {
  extensions: string[],
  parse(file: string, source: SourceFile, config: LanguageConfig): Symbol
};

// Config for symbol-parsing
export type LanguageConfig = {
  // Whether to report symbols that don't have any documentation comments & don't have documented
  // children.
  //
  // This is set to true when unit-testing
  reportUndocumented: boolean
}
