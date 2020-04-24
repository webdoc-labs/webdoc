// @flow
import type {Doc, RootDoc} from "@webdoc/types";
import {removeChildDoc} from "@webdoc/model";

export default function prune(doc: Doc, root: RootDoc) {
  if (doc.tags.find((tag) => tag.name === "prune")) {
    removeChildDoc(doc);
  } else {
    for (let i = 0; i < doc.children.length; i++) {
      prune(doc.children[i], root);
    }
  }
}
