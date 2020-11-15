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

  if (symbol.meta.params) {
    const params = symbol.meta.params;

    for (let i = 0; i < params.length; i++) {
      const dataType = params[i].dataType;

      resolveLinkArray(dataType, symbol, 1);
    }
  }
  if (symbol.meta.returns) {
    const returns = symbol.meta.returns;

    for (let i = 0; i < returns.length; i++) {
      const dataType = returns[i].dataType;

      resolveLinkArray(dataType, symbol, 1);
    }
  }

  for (let i = 0; i < symbol.members.length; i++) {
    resolveLinksRecursive(symbol.members[i], tree);
  }

  // TODO: param, returns data-types - not high priority however
}

// Resolve an array of referred names to the referred symbols
function resolveLinkArray(
  // eslint-disable-next-line no-undef
  links?: ?Array<string | any>,
  referee: Symbol,
  start: number = 0,
): void {
  if (!links) {
    return;
  }

  for (let i = start; i < links.length; i++) {
    if (typeof links[i] === "string") {
      links[i] = findAccessedSymbol(links[i], referee) || links[i];
    }
  }
}
