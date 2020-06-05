// @flow

import {type Symbol, findAccessedSymbol} from "../types/Symbol";

// This mod resolves relational links between symbols. For example, it will try to replace the
// names of the super-classes (in metadata.extends) by references to those super-class symbols.

export default function resolveLinksRecursive(
  symbol: Symbol,
  tree: Symbol = symbol,
): void {
  resolveLinkArray(symbol.meta.extends, symbol);
  resolveLinkArray(symbol.meta.implements, symbol);

  for (let i = 0; i < symbol.members.length; i++) {
    resolveLinksRecursive(symbol.members[i], tree);
  }

  // TODO: param, returns data-types - not high priority however
}

// Resolve an array of referred names to the referred symbols
function resolveLinkArray(links: any[], referee: Symbol): void {
  if (!links) {
    return;
  }

  for (let i = 0; i < links.length; i++) {
    links[i] = findAccessedSymbol(links[i], referee) || links[i];
  }
}
