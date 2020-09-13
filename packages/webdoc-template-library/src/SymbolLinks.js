// @flow
import {templateLogger} from "./Logger";
import type {Doc} from "@webdoc/types";
import {isDataType} from "@webdoc/model";

// TODO: Replace catharsis with a in-built @webdoc/data-type-parser
const catharsis = require("catharsis");

type LinkOptions = {
  cssClass?: string,
  fragmentId?: string,
  linkMap?: Map<string, string>,
  monospace?: boolean,
  shortenName?: boolean
};

const pathToUrl = new Map<string, string>();
const pathToID = new Map<string, string>();
const urlToPath = new Map<string, string>();
const usedIDs = {};
const usedFileNames = {};

const SCOPE_TO_PUNC = {};

/**
 * The types of docs that are given their own .html file. By default, this includes "ClassDoc",
 * "NSDoc", "InterfaceDoc"
 * @object
 */
const STANDALONE_DOCS = [
  "ClassDoc",
  "NSDoc",
  "InterfaceDoc",
  "MixinDoc",
  "PackageDoc",
  "TutorialDoc",
];

const hasOwnProp = Object.prototype.hasOwnProperty;

function isComplexTypeExpression(expr) {
  // record types, type unions, and type applications all count as "complex"
  return /^{.+}$/.test(expr) || /^.+\|.+$/.test(expr) || /^.+<.+>$/.test(expr);
}
function hasUrlPrefix(text) {
  return (/^(http|ftp)s?:\/\//).test(text);
}
function getShortName(docPath) {
  const parts = docPath.split(/(.|#|~)/);
  return parts[parts.length - 1];
}
function stringifyType(parsedType, cssClass, stringifyLinkMap) {
  return require("catharsis").stringify(parsedType, {
    cssClass: cssClass,
    htmlSafe: true,
    links: stringifyLinkMap,
  });
}
function parseType(longname) {
  let err;

  try {
    return catharsis.parse(longname, {jsdoc: true});
  } catch (e) {
    err = new Error(`unable to parse ${longname}: ${e.message}`);
    templateLogger.error(err);

    return longname;
  }
}
function fragmentHash(fragmentId: string): string {
  if (!fragmentId) {
    return "";
  }

  return `#${fragmentId}`;
}

/**
 * Reserves the ID for the given doc-path.
 *
 * @memberof SymbolLinks
 * @param {string} docPath
 * @param {string} fragment
 */
function registerID(docPath: string, fragment: string) {
  pathToID.set(docPath, fragment);
}

/**
 * Generates a unique ID for a DOM element (unique within each HTML file)
 *
 * @memberof SymbolLinks
 * @param {string} fileName
 * @param {string} id
 * @return {string}
 */
function generateID(fileName: string, id: string): string {
  let key;
  let nonUnique = true;

  key = id.toLowerCase();
  // HTML5 IDs cannot contain whitespace characters
  id = id.replace(/\s/g, "");

  // append enough underscores to make the identifier unique
  while (nonUnique) {
    if (hasOwnProp.call(usedIDs, fileName) && hasOwnProp.call(usedIDs[fileName], key) ) {
      id += "_";
      key = id.toLowerCase();
    } else {
      nonUnique = false;
    }
  }

  usedIDs[fileName] = usedIDs[fileName] || {};
  usedIDs[fileName][key] = id;

  return id;
}

/**
 * Returns the DOM-id for the documented symbol.
 *
 * @memberof SymbolLinks
 * @param {string} docPath - the symbol doc's path
 * @param {string}[id] - the requested id
 * @return {string} - the unique DOM-id for that symbol
 */
function getID(docPath: string, id?: string): string {
  if (pathToID.has(docPath)) {
    id = pathToID.get(docPath);
  } else if (!id) {
    // no ID required
    return "";
  } else {
    id = generateID(docPath, id);
    registerID(docPath, id);
  }

  return id || "";
}

function formatNameForLink(doclet: Doc): string {
  let newName = (doclet.name || "") + (doclet.variation || "");
  const scopePunc = SCOPE_TO_PUNC[doclet.scope] || "";

  // Only prepend the scope punctuation if it's not the same character that marks the start of a
  // fragment ID. Using `#` in HTML5 fragment IDs is legal, but URLs like `foo.html##bar` are
  // just confusing.
  if (scopePunc !== "#") {
    newName = scopePunc + newName;
  }

  return newName;
}

/**
 * @memberof SymbolLinks
 * @param {string} fileName
 * @param {string} str
 * @return {string}
 */
function generateFileName(fileName: string, str: string): string {
  let key = fileName.toLowerCase();
  let nonUnique = true;

  // Don't allow filenames to begin with an underscore
  if (!fileName.length || fileName[0] === "_") {
    fileName = `-${fileName}`;
    key = fileName.toLowerCase();
  }

  // Append enough underscores to make the filename unique
  while (nonUnique) {
    if (hasOwnProp.call(usedFileNames, key)) {
      fileName += "_";
      key += "_";
    } else {
      nonUnique = false;
    }
  }

  usedFileNames[key] = str;

  return fileName;
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
 * @memberof SymbolLinks
 * @param {string} str The string to convert.
 * @return {string} The filename to use for the string.
 */
function getFileName(str: string): string {
  if (pathToUrl.has(str)) {
    return pathToUrl.get(str);
  }

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

  const fileName = generateFileName(basename, str) + ".html"; // exports.fileExtension;

  pathToUrl.set(str, fileName);
  urlToPath.set(fileName, str);

  return fileName;
}

const registerLink = (docPath: string, fileUrl: string): string => {
  pathToUrl.set(docPath, fileUrl);
  urlToPath.set(fileUrl, docPath);

  return fileUrl;
};

/**
 * Create a URL that points to the generated documentation for the doc.
 *
 * If a doc corresponds to an output file (for example, if the doc represents a class), the
 * URL will consist of a filename.
 *
 * If a doc corresponds to a smaller portion of an output file (for example, if the doc
 * represents a method), the URL will consist of a filename and a fragment ID.
 *
 * @memberof SymbolLinks
 * @param {Doc} doc - The doc that will be used to create the URL.
 * @return {string} The URL to the generated documentation for the doc.
 */
const createLink = (doc: Doc) => {
  let fakeContainer;
  let filename;
  let fragment: string = "";
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
    filename = getFileName(docPath);
  } else if (!STANDALONE_DOCS.includes(doc.type) && fakeContainer ) {// mistagged?
    filename = getFileName(doc.memberof || docPath);
    if (doc.name !== doc.path) {
      fragment = formatNameForLink(doc);
      fragment = getID(docPath, fragment);
    }
  } else { // inside another HTML file
    filename = getFileName(doc.parent.path || exports.globalName);

    if (doc.name !== doc.path) { // || doc.scope === "SCOPE.NAMES.GLOBAL") {
      fragment = formatNameForLink(doc);
      fragment = getID(docPath, fragment);
    }
  }

  return encodeURI(filename) + fragmentHash(fragment);
};

/**
 * Build an HTML link to the symbol with the specified {@code docPath}. If the doc-path is not
 * associated with a URL, this method simply returns the link text, if provided, or the doc-path
 * itself.
 *
 * The {@code docPath} parameter can also contain a URL rather than a symbol's longname.
 *
 * This method supports type applications that can contain one or more types, such as
 * {@code Array.<MyClass>} or {@code Array.<(MyClass|YourClass)>}. In these examples, the method
 * attempts to replace `Array`, `MyClass`, and `YourClass` with links to the appropriate types.
 * The link text is ignored for type applications.
 *
 * @param {string} docPath - The longname (or URL) that is the target of the link.
 * @param {string} linkText - The text to display for the link, or `longname` if no text is
 * provided.
 * @param {Object} options - Options for building the link.
 * @param {string} options.cssClass - The CSS class (or classes) to include in the link's `<a>`
 * tag.
 * @param {string} options.fragmentId - The fragment identifier (for example, `name` in
 * `foo.html#name`) to append to the link target.
 * @param {string} options.linkMap - The link map in which to look up the longname.
 * @param {boolean} options.monospace - Indicates whether to display the link text in a monospace
 * font.
 * @param {boolean} options.shortenName - Indicates whether to extract the short name from the
 * longname and display the short name in the link text. Ignored if `linkText` is specified.
 * @return {string} the HTML link, or the link text if the link is not available.
 */
function buildLink(docPath: string, linkText: string = docPath, options: LinkOptions) {
  if (!docPath) {
    return "";
  }
  if (isDataType(docPath)) {
    let link = docPath.template;

    for (let i = 1; i < docPath.length; i++) {
      link = link.replace(`%${i}`, buildLink(docPath[i], docPath[i], options));
    }

    return link;
  } else if (typeof docPath !== "string") {
    docPath = docPath.path;// BaseDoc
  }

  if (linkText && typeof linkText !== "string") {
    linkText = linkText.path;
  }

  options.linkMap = options.linkMap || pathToUrl;

  const classString = options.cssClass ? ` class="${options.cssClass}"` : "";
  let fileUrl;
  const fragmentString = fragmentHash(options.fragmentId || "");
  let text;

  let parsedType;

  // handle cases like:
  // @see <http://example.org>
  // @see http://example.org
  const stripped = docPath ? docPath.replace(/^<|>$/g, "") : "";
  if (hasUrlPrefix(stripped)) {
    fileUrl = stripped;
    text = linkText || stripped;
  }
  // handle complex type expressions that may require multiple links
  // (but skip anything that looks like an inline tag or HTML tag)
  else if (docPath && isComplexTypeExpression(docPath) && /\{@.+\}/.test(docPath) === false &&
        /^<[\s\S]+>/.test(docPath) === false) {
    parsedType = parseType(docPath);

    // Optimize Object.fromEntires, it's ugly
    return stringifyType(parsedType, options.cssClass, Object.fromEntries(options.linkMap));
  } else {
    fileUrl = options.linkMap.has(docPath) ? options.linkMap.get(docPath) : "";
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
 * @param {string} docPath - The longname (or URL) that is the target of the link.
 * @param {string} linkText - The text to display for the link, or `longname` if no text is
 * provided.
 * @param {string}[cssClass] - The CSS class (or classes) to include in the link's `<a>` tag.
 * @param {string}[fragmentId] - The fragment identifier (for example, `name` in `foo.html#name`)
 *  to append to the link target.
 * @return {string} The HTML link, or a plain-text string if the link is not available.
 */
const linkTo = (docPath: string, linkText: string, cssClass?: string, fragmentId ?: string) =>
  buildLink(docPath, linkText, {
    cssClass: cssClass || "",
    fragmentId: fragmentId || "",
    linkMap: pathToUrl,
  });

/**
 * Retrieves all the links to the ancestors of the given {@code doc}. The first link is to the
 * direct parent while the last one is the root doc.
 *
 * @param {Doc} doc
 * @param {string} cssClass
 * @return {string[]}
 */
const getAncestorLinks = (doc: Doc, cssClass: string): string[] => {
  const ancestors = [];

  let searchDoc = doc.parent;

  while (searchDoc) {
    ancestors.push(searchDoc);
    searchDoc = searchDoc.parent;
  }

  const links = [];

  ancestors.forEach((ancestor) => {
    if (ancestor.type === "RootDoc" || !ancestor.parent) {
      return;
    }

    links.unshift(linkTo(ancestor.path, ancestor.name, cssClass));
  });

  if (links.length) {
    // links[links.length - 1] += (SCOPE_TO_PUNC[doclet.scope] || "");
  }

  return links;
};

/**
 * This API provides a mechanism for generating unique .html files and DOM-IDs for each documented
 * symbol.
 *
 * @object
 */
export const SymbolLinks = {
  STANDALONE_DOCS,
  pathToUrl,
  urlToPath,

  registerID,
  generateID,
  getID,
  generateFileName,
  getFileName,
  registerLink,
  createLink,
  buildLink,
  linkTo,
  getAncestorLinks,
};
