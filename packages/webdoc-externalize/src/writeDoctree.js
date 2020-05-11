// @flow
import type {RootDoc, Doc} from "@webdoc/types";
import type {SanitizedDoc} from "./SanitizedDoc";

function sanitizeDoc(doc: Doc): SanitizedDoc {
  const sanitized: SanitizedDoc = {
    name: doc.name,
    type: doc.type,
    access: doc.access,
    scope: doc.scope,
    version: doc.version,
    brief: doc.brief,
  };

  if (doc.children.length) {
    sanitized.children = new Array(doc.children.length);

    for (let i = 0; i < doc.children.length; i++) {
      (sanitized.children: any)[i] = sanitizeDoc(doc.children[i]);
    }
  }

  if (doc.url) {
    sanitized.url = doc.url;
  }

  return sanitized;
}

/**
 * Exports the doctree to a JSON string.
 *
 * @param {RootDoc} doctree
 * @return {string}
 */
export default function writeDoctree(doctree: RootDoc): string {
  return JSON.stringify(sanitizeDoc(doctree), null, "\t");
}
