// @flow
import type {RootDoc, Doc} from "@webdoc/types";
import type {SanitizedDoc} from "./SanitizedDoc";

function sanitizeDoc(doc: Doc): SanitizedDoc {
  const sanitized: SanitizedDoc = {
    name: doc.name,
    type: doc.type,
    children: new Array(doc.children.length),
  };

  if (doc.url) {
    sanitized.url = doc.url;
  }

  for (let i = 0; i < doc.children.length; i++) {
    sanitized.children[i] = sanitizeDoc(doc.children[i]);
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
