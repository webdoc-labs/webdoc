const {SymbolLinks} = require("@webdoc/template-library");

Object.defineProperty(exports, "pathToUrl", {
  get() {
    return Object.fromEntries(SymbolLinks.pathToUrl);
  },
});

// TODO {@link } {@code }
exports.resolveLinks = (i) => i;

/**
 * Retrieve all of the following types of members from a set of doclets:
 *
 * + Classes
 * + Externals
 * + Globals
 * + Mixins
 * + Modules
 * + Namespaces
 * + Events
 * @param {TAFFY} data The TaffyDB database to search.
 * @return {object} An object with `classes`, `externals`, `globals`, `mixins`, `modules`,
 * `events`, and `namespaces` properties. Each property contains an array of objects.
 */
exports.getMembers = (data) => {
  const members = {
    classes: data({type: "ClassDoc"}).get(),
    externals: data({type: "external"}).get(),
    events: data({type: "EventDoc"}).get(),
    globals: data({
      type: ["member", "function", "constant", "typedef"],
      memberof: {type: "RootDoc"},
    }).get(),
    mixins: data({type: "MixinDoc"}).get(),
    modules: data({type: "ModuleDoc"}).get(),
    namespaces: data({type: "NSDoc"}).get(),
    interfaces: data({type: "InterfaceDoc"}).get(),
    tutorials: data({type: "TutorialDoc"}).get(),
  };

  // strip quotes from externals, since we allow quoted names that would normally indicate a
  // namespace hierarchy (as in `@external "jquery.fn"`)
  // TODO: we should probably be doing this for other types of symbols, here or elsewhere; see
  // jsdoc3/jsdoc#396
  members.externals = members.externals.map((doclet) => {
    doclet.name = doclet.name.replace(/(^"|"$)/g, "");

    return doclet;
  });

  // functions that are also modules (as in `module.exports = function() {};`) are not globals
  members.globals = members.globals.filter((doclet) => !isModuleExports(doclet));

  return members;
};

exports.buildLink = SymbolLinks.buildLink;
exports.linkto = SymbolLinks.linkTo;
exports.getAncestorLinks = (data, doc, cssClass) =>
  SymbolLinks.getAncestorLinks(doc, cssClass);// JSDoc Compat
exports.registerLink = SymbolLinks.registerLink;
exports.createLink = SymbolLinks.createLink;
exports.getUniqueFilename = SymbolLinks.generateFileName;
