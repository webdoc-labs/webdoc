// @flow

import type {Doc, RootDoc, PropertyDoc} from "@webdoc/model";
import {doc as doc_, addChildDoc} from "@webdoc/model";

function bubbleThis(doc: Doc): Doc {
  if (doc.type === "ClassDoc" || doc.type === "ObjectDoc") {
    return doc;
  }
  if (!doc.parent) {
    return null;
  }

  return bubbleThis(doc.parent);
}

function resolvedThis(doc: PropertyDoc): boolean {
  return doc.scope === "this" &&
      (doc.parent.type === "ClassDoc" || doc.parent.type === "ObjectDoc");
}

export default function memberResolve(doc: Doc, root: RootDoc) {
  if (doc.type === "PropertyDoc" && doc.scope !== doc.parent.name &&
    !resolvedThis(doc) && doc.scope) {
    const scope = doc.scope === "this" ? bubbleThis(doc) : doc_(doc.scope, root);

    if (scope) {
      // PropertyDoc shouldn't have children
      console.log(doc.name + " parent" + " " + scope.name);

      addChildDoc(doc, scope);
      return;
    } else {
      console.warn(`Member ${doc.path} could not be resolved to ${doc.scope}`);
    }
  }

  for (let i = 0; i < doc.children.length; i++) {
    memberResolve(doc.children[i], root);
  }
}
