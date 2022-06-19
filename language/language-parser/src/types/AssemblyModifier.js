// @flow

import type {Symbol} from "./Symbol";

export type AssemblyModifier = {
  name: string,
  mod: (tree: Symbol) => any
};
