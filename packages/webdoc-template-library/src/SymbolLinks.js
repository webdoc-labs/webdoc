// @flow
import {templateLogger} from "./Logger";
const catharsis = require("catharsis");

type LinkOptions = {
  cssClass?: string,
  fragmentId?: string,
  linkMap: { [id: string]: string },
  monospace?: boolean,
  shortenName?: boolean
};

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

/**
 * This API provides a mechanism for generating unique .html file links for each documented
 * symbol.
 *
 * @object
 */
export const SymbolLinks = {
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
  buildLink(docPath: string, linkText: string, options: LinkOptions) {
    const classString = options.cssClass ? ` class="${options.cssClass}"` : "";
    let fileUrl;
    const fragmentString = ""; // fragmentHash(options.fragmentId);
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
  },
};
