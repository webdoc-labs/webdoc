import type {Symbol} from "./Symbol";

// Language-integration definition - used for parsing code into a symbol-tree
export type LanguageIntegration = {
  extensions: string[],
  parse(file: string): Symbol
};
