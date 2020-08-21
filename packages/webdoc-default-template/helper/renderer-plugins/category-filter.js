/*::
import type {Doc, DocType} from "@webdoc/types";

type CategoryConstraints = {
  access?: "public" | "protected" | "private";
  type?: DocType;
};
*/

exports.categoryFilterPlugin = (doc /*: Doc */, constraints /*: CategoryConstraints */) => {
  return doc.members.filter((child) => {
    // Match access
    if (constraints.access) {
      if ((child.access || "public") !== constraints.access) {
        return false;
      }
    }

    if (child.type === "MethodDoc" && child.name === "constructor") {
      return false;// Filter constructors always!
    }

    // Match document-type
    if (constraints.type) {
      if (Array.isArray(constraints.type)) {
        if (!constraints.type.includes(child.type)) {
          return false;
        }
      } else {
        if (constraints.type !== child.type) {
          return false;
        }
      }
    }

    return true;
  });
};
