// @flow
import type {Doc, RootDoc} from "@webdoc/types";
import type {SanitizedDoc} from "./SanitizedDoc";
import {addChildDoc} from "@webdoc/model";

function restoreDoc(sanitized: SanitizedDoc, scope?: Doc): Doc {
  const doc: Doc = {
    name: sanitized.name,
    type: sanitized.type,
    children: sanitized.children ? new Array(sanitized.children.length) : [],
    access: sanitized.access,
    scope: sanitized.scope,
    version: sanitized.version,
    brief: sanitized.brief,
  };

  if (sanitized.url) {
    doc.url = sanitized.url;
  }

  if (scope) {
    addChildDoc(doc, scope);
  }

  for (let i = 0; i < doc.children.length; i++) {
    doc.children[i] = restoreDoc((sanitized.children: any)[i], doc);
  }

  return doc;
}

/**
 * Imports the doctree from the JSON format string-data. This will not recover all of the
 * information in the original doctree.
 *
 * @param {string} data
 * @return {RootDoc}
 */
export default function readDoctree(data: string): RootDoc {
  const sanitizedDoctree = JSON.parse(data);

  return restoreDoc(sanitizedDoctree, null);
}
