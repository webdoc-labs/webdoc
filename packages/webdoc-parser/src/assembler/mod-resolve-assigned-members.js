// @flow

import type {Symbol} from "../types/Symbol";

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

export default function resolveAssignedMembersRecursive(
  symbol: Symbol,
  tree: Symbol = symbol,
): void {
  resolveToObject(symbol);

  for (let i = 0; i < symbol.members.length; i++) {
    const member = symbol.members[i];

    resolveAssignedMembersRecursive(member, tree);

    // Don't increment index if the member was moved as next child takes its place
    if (member !== symbol.members[i]) {
      --i;
    }
  }
}

// Resolve "symbol" to its assigned object parent, if one exists.
function resolveToObject(symbol: Symbol, tree: Symbol = symbol): void {
  if (symbol.meta.object) {
    const objectPath = symbol.meta.object;

    /*// Check if "doc" isn't inside its parent
    if (symbol.path !== (symbol.parent ? `${doc.parent.name}.${doc.name}` : doc.name) &&
          !resolvedThis(doc, objectPath)) {
      // Find the object doc
      const scope = objectPath === "this" ? bubbleThis(doc) : findDoc(objectPath, root);

      if (scope) {
        if (scope !== doc.parent) {
          addChildDoc(doc, scope);
        }
      } else {
        console.warn(`Member ${doc.path} could not be resolved to ${doc.object}`);
      }
    }*/
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
