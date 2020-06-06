import {taffy} from "taffydb";
import type {Doc} from "@webdoc/types";

export * from "./tag";
export * from "./doc";
export * from "./types";
export * from "./data-type";

/**
 * Exports a doc-tree in a TaffyDB database. The docs are inserted in a depth-first order.
 *
 * @param {Doc} doc
 * @param {TAFFY} db
 * @return {TAFFY}
 */
export function exportTaffy(doc: Doc, db: any = taffy()): any {
  for (let i = 0; i < doc.members.length; i++) {
    db.insert(doc.members[i]);
  }
  for (let i = 0; i < doc.members.length; i++) {
    exportTaffy(doc.members[i], db);
  }

  return db;
}
