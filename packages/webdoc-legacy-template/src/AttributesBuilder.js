const toHtmlSafeString = require("../helper").toHtmlSafeString;

/*::
export type Attribute = "abstract" | "async" | "generator" | "abstract" | "virtual" | "private" |
  "protected" | "static" | "inner" | "readonly" | "constant" | "nullable" | "non-null"
*/

const AttributesBuilder = exports.AttributesBuilder = {
  appendAttribs(doc /*: Doc */) {
    /* eslint-disable-next-line new-cap */
    const attribs = AttributesBuilder.extractAttribs(doc);

    if (!attribs || !attribs.length) {
      return;
    }

    const attribsString = toHtmlSafeString(attribs.join(", "));

    doc.attribs = `<span class="type-signature">(${attribsString}) </span>`;
  },
  extractAttribs: (doc /*: Doc */) => /*: Attribute[] */ {
    const attribs /*: Attribute[] */ = [];

    if (!doc) {
      return attribs;
    }

    if (doc.abstract) {
      attribs.push("abstract");
    }

    if (doc.async) {
      attribs.push("async");
    }

    if (doc.generator) {
      attribs.push("generator");
    }

    if (doc.virtual) {
      attribs.push("abstract");
    }

    if (doc.access && doc.access !== "public") {
      attribs.push(doc.access);
    }

    if (doc.scope && doc.scope !== "instance" && doc.scope !== "global") {
      if (doc.type === "MethodDoc" || doc.type === "PropertyDoc") {
        attribs.push(doc.scope);
      }
    }

    if (doc.readonly) {
      if (doc.type === "PropertyDoc") {
        attribs.push("readonly");
      }
    }

    if (doc.nullable === true) {
      attribs.push("nullable");
    } else if (doc.nullable === false) {
      attribs.push("non-null");
    }

    return attribs;
  },
};
