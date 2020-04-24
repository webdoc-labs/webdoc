// @flow
import type {RootDoc, Doc} from "@webdoc/types";
import {addChildDoc} from "@webdoc/model";
import type {SanitizedDoc} from "./SanitizedDoc";

function restoreDoc(sanitized: SanitizedDoc, scope?: Doc): Doc {
  const doc: Doc = {
    name: sanitized.name,
    type: sanitized.type,
    children: new Array(sanitized.children.length),
  };

  if (sanitized.url) {
    doc.url = sanitized.url;
  }

  if (scope) {
    addChildDoc(doc, scope);
  }

  for (let i = 0; i < doc.children.length; i++) {
    doc.children[i] = restoreDoc(sanitized.children[i], doc);
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
