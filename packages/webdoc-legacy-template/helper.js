
const hasOwnProp = Object.prototype.hasOwnProperty;
const files = {};

const pathToUrl = {};
const urlToPath = {};

const pathToId = {};

exports.pathToUrl = pathToUrl;

const ids = {};

const STANDALONE_DOCS = [
  "ClassDoc",
  "NSDoc",
  "FunctionDoc",
  "InterfaceDoc",
];

const SCOPE_TO_PUNC = {};

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

function isComplexTypeExpression(expr) {
  // record types, type unions, and type applications all count as "complex"
  return /^{.+}$/.test(expr) || /^.+\|.+$/.test(expr) || /^.+<.+>$/.test(expr);
}

function hasUrlPrefix(text) {
  return (/^(http|ftp)s?:\/\//).test(text);
}

/**
 * Build an HTML link to the symbol with the specified longname. If the longname is not
 * associated with a URL, this method simply returns the link text, if provided, or the longname.
 *
 * The `longname` parameter can also contain a URL rather than a symbol's longname.
 *
 * This method supports type applications that can contain one or more types, such as
 * `Array.<MyClass>` or `Array.<(MyClass|YourClass)>`. In these examples, the method attempts to
 * replace `Array`, `MyClass`, and `YourClass` with links to the appropriate types. The link text
 * is ignored for type applications.
 *
 * @param {string} docPath - The longname (or URL) that is the target of the link.
 * @param {string=} linkText - The text to display for the link, or `longname` if no text is
 * provided.
 * @param {Object} options - Options for building the link.
 * @param {string=} options.cssClass - The CSS class (or classes) to include in the link's `<a>`
 * tag.
 * @param {string=} options.fragmentId - The fragment identifier (for example, `name` in
 * `foo.html#name`) to append to the link target.
 * @param {string=} options.linkMap - The link map in which to look up the longname.
 * @param {boolean=} options.monospace - Indicates whether to display the link text in a monospace
 * font.
 * @param {boolean=} options.shortenName - Indicates whether to extract the short name from the
 * longname and display the short name in the link text. Ignored if `linkText` is specified.
 * @return {string} The HTML link, or the link text if the link is not available.
 */
function buildLink(docPath, linkText, options) {
  const classString = options.cssClass ? ` class="${options.cssClass}"` : "";
  let fileUrl;
  const fragmentString = ""; // fragmentHash(options.fragmentId);
  let stripped;
  let text;

  let parsedType;

  // handle cases like:
  // @see <http://example.org>
  // @see http://example.org
  stripped = docPath ? docPath.replace(/^<|>$/g, "") : "";
  if (hasUrlPrefix(stripped)) {
    fileUrl = stripped;
    text = linkText || stripped;
  }
  // handle complex type expressions that may require multiple links
  // (but skip anything that looks like an inline tag or HTML tag)
  else if (docPath && isComplexTypeExpression(docPath) && /\{@.+\}/.test(docPath) === false &&
      /^<[\s\S]+>/.test(docPath) === false) {
    parsedType = parseType(docPath);

    return stringifyType(parsedType, options.cssClass, options.linkMap);
  } else {
    fileUrl = hasOwnProp.call(options.linkMap, docPath) ? options.linkMap[docPath] : "";
    text = linkText || (options.shortenName ? getShortName(docPath) : docPath);
  }

  text = options.monospace ? `<code>${text}</code>` : text;

  if (!fileUrl) {
    return text;
  } else {
    return `<a href="${encodeURI(fileUrl + fragmentString)}"${classString}>${text}</a>`;
  }
}

/**
 * Retrieve an HTML link to the symbol with the specified longname. If the longname is not
 * associated with a URL, this method simply returns the link text, if provided, or the longname.
 *
 * The `longname` parameter can also contain a URL rather than a symbol's longname.
 *
 * This method supports type applications that can contain one or more types, such as
 * `Array.<MyClass>` or `Array.<(MyClass|YourClass)>`. In these examples, the method attempts to
 * replace `Array`, `MyClass`, and `YourClass` with links to the appropriate types. The link text
 * is ignored for type applications.
 *
 * @function
 * @param {string} docPath - The longname (or URL) that is the target of the link.
 * @param {string=} linkText - The text to display for the link, or `longname` if no text is
 * provided.
 * @param {string=} cssClass - The CSS class (or classes) to include in the link's `<a>` tag.
 * @param {string=} fragmentId - The fragment identifier (for example, `name` in `foo.html#name`) to
 * append to the link target.
 * @return {string} The HTML link, or a plain-text string if the link is not available.
 */
const linkto = exports.linkto = (docPath, linkText, cssClass, fragmentId) => buildLink(docPath, linkText, {
  cssClass: "",
  fragmentId: "",
  linkMap: pathToUrl,
});

/**
 * Retrieve links to a member's ancestors.
 *
 * @param {TAFFY} data - The TaffyDB database to search.
 * @param {Object} doclet - The doclet whose ancestors will be retrieved.
 * @param {string} [cssClass] - The CSS class to include in the `class` attribute for each link.
 * @return {Array.<string>} HTML links to a member's ancestors.
 */
exports.getAncestorLinks = (data, doclet, cssClass) => {
  const ancestors = [];

  let searchDoc = doclet.parent;

  while (searchDoc) {
    ancestors.push(searchDoc);
    searchDoc = searchDoc.parent;
  }

  const links = [];

  ancestors.forEach((ancestor) => {
    const linkText = (SCOPE_TO_PUNC[ancestor.scope] || "") + ancestor.name;
    const link = linkto(ancestor.path, linkText, cssClass);

    links.push(link);
  });

  if (links.length) {
    links[links.length - 1] += (SCOPE_TO_PUNC[doclet.scope] || "");
  }

  return links;
};

function makeUniqueId(filename, id) {
  let key;
  let nonUnique = true;

  key = id.toLowerCase();

  // HTML5 IDs cannot contain whitespace characters
  id = id.replace(/\s/g, "");

  // append enough underscores to make the identifier unique
  while (nonUnique) {
    if ( hasOwnProp.call(ids, filename) && hasOwnProp.call(ids[filename], key) ) {
      id += "_";
      key = id.toLowerCase();
    } else {
      nonUnique = false;
    }
  }

  ids[filename] = ids[filename] || {};
  ids[filename][key] = id;

  return id;
}

const registerId = exports.registerId = (longname, fragment) => {
  pathToId[longname] = fragment;
};

// eslint-disable-next-line
/**
 * Get a doclet's ID if one has been registered; otherwise, generate a unique ID, then register
 * the ID.
 * @private
 */
function getId(docPath, id) {
  if (hasOwnProp.call(pathToId, docPath) ) {
    id = pathToId[docPath];
  } else if (!id) {
    // no ID required
    return "";
  } else {
    id = makeUniqueId(docPath, id);
    registerId(docPath, id);
  }

  return id;
}

function formatNameForLink(doclet) {
  let newName = doclet.type + (doclet.name || "") + (doclet.variation || "");
  const scopePunc = SCOPE_TO_PUNC[doclet.scope] || "";

  // Only prepend the scope punctuation if it's not the same character that marks the start of a
  // fragment ID. Using `#` in HTML5 fragment IDs is legal, but URLs like `foo.html##bar` are
  // just confusing.
  if (scopePunc !== "#") {
    newName = scopePunc + newName;
  }

  return newName;
}


const registerLink = exports.registerLink = (docPath, fileUrl) => {
  pathToUrl[docPath] = fileUrl;
  urlToPath[fileUrl] = docPath;
};

function getFilename(docPath) {
  let fileUrl;

  if (hasOwnProp.call(pathToUrl, docPath) ) {
    fileUrl = pathToUrl[docPath];
  } else {
    fileUrl = getUniqueFilename(docPath);
    registerLink(docPath, fileUrl);
  }

  return fileUrl;
}

/**
 * Create a URL that points to the generated documentation for the doc.
 *
 * If a doc corresponds to an output file (for example, if the doc represents a class), the
 * URL will consist of a filename.
 *
 * If a doc corresponds to a smaller portion of an output file (for example, if the doc
 * represents a method), the URL will consist of a filename and a fragment ID.
 *
 * @param {Doc} doc - The doc that will be used to create the URL.
 * @return {string} The URL to the generated documentation for the doc.
 */
exports.createLink = (doc) => {
  let fakeContainer;
  let filename;
  let fragment = "";
  const docPath = doc.path;
  let match;

  // handle doclets in which doc.path implies that the doc gets its own HTML file, but
  // doc.type says otherwise. this happens due to mistagged JSDoc (for example, a module that
  // somehow has doc.type set to `member`).
  // TODO: generate a warning (ideally during parsing!)
  if (!STANDALONE_DOCS[doc.type]) {
    match = /(\S+):/.exec(docPath);
    if (match && STANDALONE_DOCS.includes(match[1])) {
      fakeContainer = match[1];
    }
  }

  // the doc gets its own HTML file
  if (STANDALONE_DOCS.includes(doc.type)) {
    filename = getFilename(docPath);
  } else if (!STANDALONE_DOCS.includes(doc.type) && fakeContainer ) {// mistagged?
    filename = getFilename(doc.memberof || docPath);
    if (doc.name !== doc.path) {
      fragment = formatNameForLink(doc);
      fragment = getId(docPath, fragment);
    }
  } else { // inside another HTML file
    filename = getFilename(doc.memberof || exports.globalName);
    if ( (doc.name !== doc.path) || (doc.scope === SCOPE.NAMES.GLOBAL) ) {
      fragment = formatNameForLink(doc);
      fragment = getId(docPath, fragment);
    }
  }

  return encodeURI(filename);// + fragmentHash(fragment));
};

function makeUniqueFilename(filename, str) {
  let key = filename.toLowerCase();
  let nonUnique = true;

  // don't allow filenames to begin with an underscore
  if (!filename.length || filename[0] === "_") {
    filename = `-${filename}`;
    key = filename.toLowerCase();
  }

  // append enough underscores to make the filename unique
  while (nonUnique) {
    if ( hasOwnProp.call(files, key) ) {
      filename += "_";
      key = filename.toLowerCase();
    } else {
      nonUnique = false;
    }
  }

  files[key] = str;

  return filename;
}

/**
 * Convert a string to a unique filename, including an extension.
 *
 * Filenames are cached to ensure that they are used only once. For example, if the same string is
 * passed in twice, two different filenames will be returned.
 *
 * Also, filenames are not considered unique if they are capitalized differently but are otherwise
 * identical.
 *
 * @function
 * @param {string} str The string to convert.
 * @return {string} The filename to use for the string.
 */
const getUniqueFilename = (str) => {
  let basename = (str || "")
  // use - instead of : in namespace prefixes
  // replace characters that can cause problems on some filesystems
    .replace(/[\\/?*:|'"<>]/g, "_")
  // use - instead of ~ to denote 'inner'
    .replace(/~/g, "-")
  // use _ instead of # to denote 'instance'
    .replace(/#/g, "_")
  // use _ instead of / (for example, in module names)
    .replace(/\//g, "_")
  // remove the variation, if any
    .replace(/\([\s\S]*\)$/, "")
  // make sure we don't create hidden files, or files whose names start with a dash
    .replace(/^[.-]/, "");

  // in case we've now stripped the entire basename (uncommon, but possible):
  basename = basename.length ? basename : "_";

  return makeUniqueFilename(basename, str) + ".html"; // exports.fileExtension;
};

exports.getUniqueFilename = getUniqueFilename;
