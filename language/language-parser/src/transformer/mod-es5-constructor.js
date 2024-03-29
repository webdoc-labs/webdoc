// @flow

import {addChildDoc, createDoc, isConstructor} from "@webdoc/model";
import type {Doc} from "@webdoc/types";

/**
 * This will generate a {@link MethodDoc} constructor for classes, if not present.
 *
 * @param {Doc} doc
 */
export default function es5Constructor(doc: Doc) {
  if (doc.type === "ClassDoc") {
    const classDescTag = doc.tags && doc.tags.find((tag) => tag.type === "ClassDescTag");

    if (!doc.members.find(isConstructor)) {
      const constructorDoc = createDoc("constructor", "MethodDoc", {
        brief: doc.brief,
        description: classDescTag ? doc.description : "",
        params: doc.params ?? [],
        returns: doc.returns,
      });

      if (classDescTag) {
        delete doc.brief;
        doc.description = classDescTag.value;
      }

      addChildDoc(constructorDoc, doc);
    } else if (classDescTag) {
      doc.description = doc.description ? doc.description + classDescTag.value : classDescTag.value;
    }
  }

  // Continue down because classes still may have classes as members.
  doc.members.forEach(es5Constructor);
}
