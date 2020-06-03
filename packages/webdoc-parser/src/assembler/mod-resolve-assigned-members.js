// @flow

import {type Symbol, findSymbol, addChildSymbol} from "../types/Symbol";

// This mod resolves symbols were "assigned" to another symbol parent in source code. For example,

// this.propertyName = "defaultValue";
// ^^^^
// "propertyName" will be moved under the closest class, object, mixin, or interface ancestor.

// ObjectName.staticProperty = "dataValue";
// ^^^^^^^^^^
// "staticProperty" will be moved under the closest symbol named "ObjectName". "ObjectName" doesn't
// neccessarily have to be an ancestor of the symbol "staticProperty" when passed in, however.

// ObjectName.nestedObject.propertyName = "dataValue";
// ^^^^^^^^^^^^^^^^^^^^^^^
//
// "propertyName" will be moved under "nestedObject" which is expected to exist

// Retry-queue for symbols' objects not found in the first try.
let retryQueue: Array<Symbol>;

export default function resolveAssignedMembersRecursive(
  symbol: Symbol,
  tree: Symbol = symbol,
): ?number {
  if (symbol === tree) {
    // Initialize retryQueue for this assembly-modifier pass
    retryQueue = [];
  } else {
    resolveToObject(symbol, tree);
  }

  for (let i = 0; i < symbol.members.length; i++) {
    const member = symbol.members[i];

    resolveAssignedMembersRecursive(member, tree);

    // Don't increment index if the member was moved as next child takes its place
    if (member !== symbol.members[i]) {
      --i;
    }
  }

  if (symbol === tree && retryQueue.length) {
    // retryQueue pass

    let lastQueueSize = -1;
    let tryQueue = retryQueue;

    retryQueue = [];

    // Keep trying to resolve symbols unless not even a single symbol is resolved
    while (tryQueue.length !== lastQueueSize) {
      for (let i = 0; i < tryQueue.length; i++) {
        resolveToObject(tryQueue[i], tree);
      }

      lastQueueSize = tryQueue.length;
      tryQueue = retryQueue;

      retryQueue = [];
    }

    if (retryQueue.length) {
      console.error("{@assembly-mod resolve-assigned-members} failed to resolve these symbols: ");

      retryQueue.forEach((sym) => {
        console.error(`\t ${symbol.canonicalName} [to ${symbol.meta.object}]`);
      });

      // Error code for unit-testing
      return -1;
    }
  }
}

// Resolve "symbol" to its assigned object parent, if one exists.
function resolveToObject(symbol: Symbol, tree: Symbol = symbol): void {
  if (symbol.meta.object) {
    const objectPath = symbol.meta.object;

    // Reposition the symbol only if its parent is not the object
    if (symbol.canonicalName !== `${objectPath}.${symbol.simpleName}` ||
          (objectPath === "this" && !isParentThis(symbol))) {
      // Search for the object symbol
      const objectSymbol = (objectPath === "this") ?
        bubbleThis(symbol) :
        findSymbol(objectPath, tree);

      if (objectSymbol) {
        if (objectSymbol !== symbol.parent) {
          addChildSymbol(symbol, objectSymbol);
        }
      } else {
        // Push symbols whose object may not exist yet, because they themselves are assigned
        // properties. For example, "propertyName"'s object "nestedObject" is itself a property of
        // "object":
        //
        // nestedObject.propertyName = "dataValue";
        // object.nestedObject = {};
        // const object = {};

        retryQueue.push(symbol);
      }
    }
  }
}

// Bubble through the ancestors of "sym" to find the "this" context for it.
function bubbleThis(sym: Symbol): Symbol {
  if (sym.meta.type === "ClassDoc" || sym.meta.type === "ObjectDoc" ||
        sym.meta.type === "MixinDoc" || sym.meta.type === "InterfaceDoc") {
    return sym;
  }
  if (!sym.parent) {
    return null;
  }

  return bubbleThis(sym.parent);
}

// Check whether the symbol's parent is its "this" context.
function isParentThis(sym: Symbol): Symbol {
  if (!sym.parent) {
    return true;
  }

  const parentType = sym.parent.meta.type;

  return parentType === "ClassDoc" || parentType === "ObjectDoc" ||
      parentType === "MixinDoc" || parentType === "InterfaceDoc";
}
