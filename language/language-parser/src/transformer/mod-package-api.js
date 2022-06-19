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

  if (doc.type !== "RootDoc" && doc.parent &&
    // Only top-level stuff can switch packages
    (doc.parent.type === "RootDoc" || doc.parent.type === "NSDoc" ||
      // and classes, objects, namespaces nested beneath
      doc.type === "ObjectDoc" || doc.type === "ClassDoc" || doc.type === "NSDoc")
  ) {
    const ppkg = doc.parent.loc ? doc.parent.loc.file.package : null;
    const pkg = doc.loc ? doc.loc.file.package : null;

    if (pkg && pkg !== ppkg) {
      pkg.api.push(doc);
    }
  }

  doc.members.forEach((member) => {
    packageApi(member);
  });
}
