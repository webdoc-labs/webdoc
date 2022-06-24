// @flow

import type {Symbol} from "@webdoc/language-library";

export type AssemblyModifier = {
  name: string,
  mod: (tree: Symbol) => any
};
