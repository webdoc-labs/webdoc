// @flow

import type {Doc, RootDoc} from "@webdoc/types";
import {removeChildDoc} from "@webdoc/model";

export default function prune(doc: Doc, root: RootDoc) {
  let anchoredChildren = 0;

  if (doc.tags && doc.tags.find((tag) => tag.name === "ignore")) {
    removeChildDoc(doc);
    return;
  } else {
    for (let i = 0; i < doc.members.length; i++) {
      const member = doc.members[i];

      prune(member, root);

      if (member.parserOpts && member.parserOpts.undocumentedAnchored) {
        anchoredChildren++;
      }
    }
  }

  // Prune undocumented docs with no children too OR only anchored children.
  // (anchored children _can_ be pruned but are not if any ancestor is retained)
  if (
    doc.parserOpts &&
    doc.parserOpts.undocumented &&
    !doc.parserOpts.undocumentedAnchored &&
    doc.members.length === anchoredChildren
  ) {
    removeChildDoc(doc);
  }
  if (doc.type !== "PropertyDoc" && doc.type !== "MethodDoc" && doc.type !== "FunctionDoc") {
    // only class members could be "instance"
    if (doc.scope === "instance") {
      delete doc.scope;
    }
  }
}
