// @flow
import type {Doc, RootDoc} from "@webdoc/types";
import type {SanitizedDoc} from "./SanitizedDoc";

function sanitizeDoc(doc: Doc): SanitizedDoc {
  const sanitized: SanitizedDoc = {
    name: doc.name,
    type: doc.type,
    access: doc.access,
    scope: doc.scope,
    version: doc.version,
    brief: doc.brief,
    description: doc.description,
  };

  if (doc.members.length) {
    sanitized.members = new Array(doc.members.length);

    for (let i = 0; i < doc.members.length; i++) {
      (sanitized.members: any)[i] = sanitizeDoc(doc.members[i]);
    }
  }

  if ((doc: any).url) {
    sanitized.url = (doc: any).url;
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
