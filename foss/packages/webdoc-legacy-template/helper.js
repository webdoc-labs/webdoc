// @flow

const {traverse, isMethod, isFunction, isProperty, isTypedef} = require("@webdoc/model");

/*::
import type {
  ClassDoc,
  Doc,
  EventDoc,
  GlobalDoc,
  MixinDoc,
  ModuleDoc,
  NSDoc,
  InterfaceDoc
  TutorialDoc
} from "@webdoc/types";
*/

/*::
export type TypedMembers = {
  classes: ClassDoc[],
  externals: Doc[],
  events: EventDoc[],
  globals: GlobalDoc[],
  mixins: MixinDoc[],
  modules: ModuleDoc[],
  namespaces: NSDoc[],
  interfaces: InterfaceDoc[],
  tutorials: TutorialDoc[]
}
*/

// Extracts all the documents into buckets of each type
exports.getTypedMembers = (documentTree /*: RootDoc */) /*: TypedMembers */ => {
  const typedMembers = {
    classes: [],
    externals: [],
    events: [],
    globals: [],
    mixins: [],
    modules: [],
    namespaces: [],
    interfaces: [],
    tutorials: [],
  };

  traverse(documentTree, (doc) => {
    if (doc.parent === documentTree &&
        (isMethod(doc) || isFunction(doc) || isProperty(doc) || isTypedef(doc))) {
      // typedMembers.globals.push(doc);
      return;
    }
    if (doc.undocumented || doc.access === "private") {
      return;
    }

    switch (doc.type) {
    case "ClassDoc":
      typedMembers.classes.push(doc);
      break;
    case "ExternalDoc":
      typedMembers.externals.push(doc);
      break;
    case "EventDoc":
      typedMembers.events.push(doc);
      break;
    case "ModuleDoc":
      typedMembers.modules.push(doc);
      break;
    case "NSDoc":
      typedMembers.namespaces.push(doc);
      break;
    case "InterfaceDoc":
      typedMembers.interfaces.push(doc);
      break;
    case "TutorialDoc":
      typedMembers.tutorials.push(doc);
      break;
    }
  });

  typedMembers.namespaces.sort((m1, m2) => m1.path.localeCompare(m2.path));
  typedMembers.classes.sort((m1, m2) => m1.path.localeCompare(m2.path));

  // strip quotes from externals, since we allow quoted names that would normally indicate a
  // namespace hierarchy (as in `@external "jquery.fn"`)
  // TODO: we should probably be doing this for other types of symbols, here or elsewhere; see
  // jsdoc3/jsdoc#396
  typedMembers.externals = typedMembers.externals.map((doclet) => {
    doclet.name = doclet.name.replace(/(^"|"$)/g, "");

    return doclet;
  });

  return typedMembers;
};

exports.toHtmlSafeString = (str /*: string */) /*: string */ => {
  if (typeof str !== "string") {
    str = String(str);
  }

  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
};
