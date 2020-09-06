// @flow

import type {Doc} from "@webdoc/types";

/**
 * Resolves each package's top-level API docs.
 *
 * @param {Doc} doc - root of document tree
 */
export default function packageApi(doc: Doc): void {
  if (global.__TEST__) {
    return;// packageApi does not run on testing environment
  }

  if (doc.type !== "RootDoc") {
    const ppkg = doc.parent.loc ? doc.parent.loc.file.package : null;
    const pkg = doc.loc.file.package;

    if (pkg !== ppkg) {
      pkg.api.push(doc);
    }
  }

  doc.members.forEach((member) => {
    packageApi(member);
  });
}
