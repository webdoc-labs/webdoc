// @flow

import {doc as findDoc, addChildDoc} from "@webdoc/model";
import type {Doc, RootDoc} from "@webdoc/types";

function bubbleThis(doc: Doc): Doc {
  if (doc.type === "ClassDoc" || doc.type === "ObjectDoc" ||
        doc.type === "MixinDoc" || doc.type === "InterfaceDoc") {
    return doc;
  }

  if (!doc.parent) {
    return null;
  }

  return bubbleThis(doc.parent);
}

function resolvedThis(doc: Doc, object: string): boolean {
  return object === "this" &&
      (!doc.parent || doc.parent.type === "ClassDoc" || doc.parent.type === "ObjectDoc");
}

export default function memberResolve(doc: Doc, root: RootDoc) {
  if (doc.parserOpts && doc.parserOpts.object) {
    const objectPath = doc.parserOpts.object;

    // Check if "doc" isn't inside its parent
    if (doc.path !== (doc.parent ? `${doc.parent.name}.${doc.name}` : doc.name) &&
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
    }
  }

  for (let i = 0; i < doc.children.length; i++) {
    const child = doc.children[i];

    memberResolve(doc.children[i], root);

    if (child !== doc.children[i]) {
      --i;
    }
  }
}
