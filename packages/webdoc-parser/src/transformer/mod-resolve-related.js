// @flow

import type {Doc, DocLink, Param, Return, RootDoc} from "@webdoc/types";
import {doc as findDoc} from "@webdoc/model";

// Resolve all string symbol-paths in array to the actual Doc from the tree.
function resolveArray(array: DocLink[], doc: Doc, tree: RootDoc, start: number = 0) {
  for (let i = start; i < array.length; i++) {
    const symbolPath = array[i];

    if (typeof symbolPath !== "string") {
      // Don't hurt already resolved docs, if any
      continue;
    }

    const symbolDoc = findDoc(symbolPath, tree);

    // Only replace symbolPath in the array if the doc is found
    if (symbolDoc) {
      array[i] = symbolDoc;
    }
  }
}

/**
 * + Resolves all docs listed in the "extends", "implements", "mixes". This prevent redundant
 *    searches to extended/implemented/mixed symbols.
 *
 * + Replaces the "default" scopes for properties with a good guess. (The @property tag parser puts
 *    "default" scope on the PropertyDocs it creates)
 *
 * + Brings down any methods/properties coming from parent classes & mixins. Adds the implementation
 *    property to methods/properties that come from interfaces.
 *
 * @param {Doc} doc
 * @param {RootDoc} tree
 */
export default function resolveRelated(doc: Doc, tree: RootDoc) {
  if (doc.extends) {
    resolveArray(doc.extends, doc, tree);
  }

  if (doc.implements) {
    resolveArray((doc.implements: any), doc, tree);
  }

  if (doc.mixes) {
    resolveArray((doc.mixes: any), doc, tree);
  }

  if (doc.params) {
    const params = ((doc: any).params: Param[]);

    for (let i = 0; i < params.length; i++) {
      if (params[i].dataType) {
        resolveArray(params[i].dataType, doc, tree, 1);
      }
    }
  }

  if (doc.returns) {
    const returns = ((doc: any).returns: Return[]);

    for (let i = 0; i < returns.length; i++) {
      if (returns[i].dataType) {
        resolveArray(returns[i].dataType, doc, tree, 1);
      }
    }
  }

  if (doc.type === "PropertyDoc" && doc.scope === "default") {
    if (doc.parent && (doc.parent.type === "InterfaceDoc" || doc.parent.type === "ClassDoc")) {
      doc.scope = "instance";
    } else {
      doc.scope = "static";
    }
  }

  for (let i = 0; i < doc.members.length; i++) {
    resolveRelated(doc.members[i], tree);
  }
}
