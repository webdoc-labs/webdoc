import {taffy} from "taffydb";
import type {Doc} from "@webdoc/types";

export * from "./tag";
export * from "./doc";

/**
 * Exports a doc-tree in a TaffyDB database. The docs are inserted in a depth-first order.
 *
 * @param {Doc} doc
 * @param {TAFFY} db
 * @return {TAFFY}
 */
export function exportTaffy(doc: Doc, db: any = taffy()): any {
  for (let i = 0; i < doc.children.length; i++) {
    db.insert(doc.children[i]);
  }
  for (let i = 0; i < doc.children.length; i++) {
    exportTaffy(doc.children[i], db);
  }

  return db;
}
