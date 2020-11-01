// @flow
import type {Doc, DocType} from "@webdoc/types";
import {isDataType} from "@webdoc/model";
import {templateLogger} from "../Logger";

export type LinkOptions = {
  cssClass?: string,
  fragmentId?: string,
  linkMap?: Map<string, string>,
  monospace?: boolean,
  shortenName?: boolean
};

export type LinkerDocumentRecord = {
  uri?: string,
};

export type LinkerFileRecord = {
  uriFragments: Set<string>,
  uri?: string,
};

/**
 * Shell wrapper around {@link LinkerPlugin}.
 *
 * @return {LinkerPluginCls} The linker plugin class object.
 */
function LinkerPluginShell() {
  // TODO: Replace catharsis with a in-built @webdoc/data-type-parser
  const catharsis = require("catharsis");
  const {query} = require("@webdoc/model");
  const {MixinPlugin} = require("./MixinPlugin");

  /* -----------------------Helper Functions--------------------------------- */
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
  function mapToLinks(documentRegistry) {
    const keys = documentRegistry.keys();
    const object = {};

    keys.forEach((key) => {
      object[key] = documentRegistry.get(key).uri;
    });

    return object;
  }
  /* -------------------------------------------------------------- */

  /**
   * @class LinkerPlugin
   */
  class LinkerPluginImpl extends MixinPlugin {
    /**
     * The documents that are rendered into standalone files. By default, only
     * classes, namespaes, interfaces, mixins, packages, and tutorials are
     * standalone.
     */
    standaloneDocTypes: Array<DocType> = [
      "ClassDoc",
      "NSDoc",
      "InterfaceDoc",
      "MixinDoc",
      "PackageDoc",
      "TutorialDoc",
    ];

    /**
     * This holds all the linker's data on each document, mapped from the document
     * IDs.
     * @protected
     */
    documentRegistry = new Map<string, LinkerDocumentRecord>();

    /**
     * This holds all the linker's data on each output file, mapping each URI lowercased.
     * @protected
     */
    fileRegistry = new Map<string, LinkerFileRecord>();

    /**
     * Cache of DPL queries to their URIs.
     */
    queryCache = new Map<string, string>();

    /**
     * Returns the linker's record on a specific document, creating a new one if one does not exist
     * already.
     *
     * @param {string} id - The ID of the document whose record is requested.
     * @return {LinkerDocumentRecord} All the data this linker has on the document.
     */
    getDocumentRecord(id: string): LinkerDocumentRecord {
      if (typeof id !== "string") {
        throw new Error("The id must be a valid string!");
      }

      const recordHit = this.documentRegistry.get(id);

      if (!recordHit) {
        const record: LinkerDocumentRecord = {};

        this.documentRegistry.set(id, record);

        return record;
      }

      return recordHit;
    }

    /**
     * Returns the linker's record on a specific output file, creating a new one if
     * one does not exist already.
     *
     * @param {string} uri - The URI for the output file.
     * @return {LinkerFileRecord} All the data this linker has on the output file.
     */
    getFileRecord(uri: string): LinkerFileRecord {
      const recordHit = this.fileRegistry.get(uri.toLowerCase());

      if (!recordHit) {
        const record: LinkerFileRecord = {
          uriFragments: new Set<string>(),
        };

        this.fileRegistry.set(uri, record);

        return record;
      }

      return recordHit;
    }

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
     * @param {boolean} options.monospace - Indicates whether to display the link text in a
     *  monospace font.
     * @param {boolean} options.shortenName - Indicates whether to extract the short name from the
     * longname and display the short name in the link text. Ignored if `linkText` is specified.
     * @return {string} the HTML link, or the link text if the link is not available.
     */
    linkTo(docPath: string, linkText: string = docPath, options: LinkOptions = {}) {
      if (!docPath) {
        return "";
      }
      if (this.queryCache.has(docPath)) {
        return this.queryCache.get(docPath);
      }
      if (isDataType(docPath)) {
        let link = docPath.template;

        for (let i = 1; i < docPath.length; i++) {
          link = link.replace(`%${i}`, this.linkTo(docPath[i], docPath[i], options));
        }

        return link;
      } else if (typeof docPath !== "string") {
        docPath = docPath.path;// BaseDoc
      }

      if (linkText && typeof linkText !== "string") {
        linkText = linkText.path;
      }

      const classString = options.cssClass ? ` class="${options.cssClass}"` : "";
      let fileUrl;
      const fragmentString = options.fragmentId ? "#" + options.fragmentId : "";
      let text;

      let parsedType;

      // handle cases like:
      // @see <http://example.org>
      // @see http://example.org
      const stripped = docPath ? docPath.replace(/^<|>$/g, "") : "";
      if (hasUrlPrefix(stripped)) {
        fileUrl = stripped;
        text = linkText || stripped;
      } // eslint-disable-line brace-style
      // handle complex type expressions that may require multiple links
      // (but skip anything that looks like an inline tag or HTML tag)
      else if (docPath && isComplexTypeExpression(docPath) && /\{@.+\}/.test(docPath) === false &&
            /^<[\s\S]+>/.test(docPath) === false) {
        parsedType = parseType(docPath);

        // Optimize Object.fromEntires, it's ugly
        return stringifyType(parsedType, options.cssClass, mapToLinks(this.documentRegistry));
      } else {
        const doc = query(docPath, this.renderer.docTree)[0];

        if (!doc) {
          return text;
        }

        const rec = this.documentRegistry.get(doc.id);

        fileUrl = rec ? rec.uri : this.getURI(doc);

        // Cache this query
        if (fileUrl) {
          this.queryCache.set(docPath, fileUrl);
        }
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
     * Retrieves all the links to the ancestors of the given {@code doc}. The first link is to the
     * direct parent while the last one is the root doc.
     *
     * @param {Doc} doc
     * @param {string} cssClass
     * @return {string[]}
     */
    linksToAncestors(doc: Doc, cssClass: string): string[] {
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

        links.unshift(this.linkTo(ancestor.path, ancestor.name, cssClass));
      });

      if (links.length) {
        // links[links.length - 1] += (SCOPE_TO_PUNC[doclet.scope] || "");
      }

      return links;
    }

    /**
     * @override
     */
    getMixin() {
      return {
        linkTo: this.linkTo.bind(this),
      };
    }

    /**
     * @override
     */
    getShell() {
      return LinkerPluginShell;
    }

    /**
     * Returns the URI pointing to the document's output file. An unique URI is created, if one
     * wasn't already.
     *
     * @param {Doc} doc
     * @return {string}
     */
    getURI(doc: Doc): string {
      const id = doc.id;

      const record = this.getDocumentRecord(id);
      let uri = record.uri;

      if (!uri) {
        uri = this.generateURI(doc);
        record.uri = uri;
      }

      return uri;
    }

    createURI(preferredUri: string): string {
      const uri = this.generateBaseURI(preferredUri);

      this.getFileRecord(uri);

      return uri;
    }

    /**
     * Convert a string to a unique filename, including an extension.
     *
     * Filenames are cached to ensure that they are used only once. For example, if the same
     * string is passed in twice, two different filenames will be returned.
     *
     * Also, filenames are not considered unique if they are capitalized differently but are
     * otherwise identical.
     *
     * @private
     * @param {string} canonicalPath - The canonical
     * @return {string} The filename to use for the string.
     */
    generateBaseURI(canonicalPath: string): string {
      let seedURI = (canonicalPath || "")
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
      seedURI = seedURI.length ? seedURI : "_";
      seedURI += ".html";

      let probeURI = seedURI;
      let probeKey = seedURI.toLowerCase();
      let nonUnique = true;

      // Don't allow filenames to begin with an underscore
      if (!seedURI.length || seedURI[0] === "_") {
        probeURI = `-${seedURI}`;
        probeKey = probeURI.toLowerCase();
      }

      // Append enough underscores to make the filename unique
      while (nonUnique) {
        if (this.fileRegistry.has(probeKey)) {
          probeURI += "_";
          probeKey += "_";
        } else {
          nonUnique = false;
        }
      }

      return probeURI;
    }

    /**
     * Generates a unique ID for a DOM element (unique within each HTML file)
     *
     * @private
     * @param {string} fileName
     * @param {string} id
     * @param {Set<string>} usedIDs
     * @return {string}
     */
    generateURIFragment(fileName: string, id: string, usedIDs: Set<string>): string {
      let key;
      let nonUnique = true;

      key = id.toLowerCase();
      // HTML5 IDs cannot contain whitespace characters
      id = id.replace(/\s/g, "");

      // append enough underscores to make the identifier unique
      while (nonUnique) {
        if (usedIDs.has(key)) {
          id += "_";
          key = id.toLowerCase();
        } else {
          nonUnique = false;
        }
      }

      usedIDs.add(key);

      return id;
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
     * @private
     * @param {Doc} doc - The doc that will be used to create the URL.
     * @return {string} The URL to the generated documentation for the doc.
     */
    generateURI(doc: Doc) {
      if (typeof doc === "string") {
        throw new Error("Invalid argument, cannot generate an URI from a document path.");
      }

      let baseURI: string;
      let fragment: string;
      const docPath = doc.path;
      const {standaloneDocTypes} = this;

      // the doc gets its own HTML file
      if (standaloneDocTypes.includes(doc.type)) {
        baseURI = this.generateBaseURI(docPath);

        this.getFileRecord(baseURI);
      } else { // inside another HTML file
        baseURI = doc.parent.type !== "RootDoc" ? this.getURI(doc.parent) : "global.html";
        fragment = this.generateURIFragment(
          baseURI,
          doc.name,
          this.getFileRecord(baseURI).uriFragments,
        );
      }

      return `${encodeURI(baseURI)}${fragment ? "#" + fragment : ""}`;
    }
  }

  return LinkerPluginImpl;
}

/* eslint-disable-next-line new-cap */
const LinkerPlugin = LinkerPluginShell();

export {LinkerPlugin};
export {LinkerPluginShell};
