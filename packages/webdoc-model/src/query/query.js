// @flow

import type {Doc} from "@webdoc/types";
import {parse} from "./parse";

/**
 * Runs a query in the document tree and returns the matching document, according to the
 * Document Path Langugage expression {@code query}.
 *
 * @param {string} queryExpr - The query expression.
 * @param {Doc} docTree - The root of the document tree to be queried.
 * @return {Doc[]} The list of documents matching the query.
 */
export function query(queryExpr: string, docTree: Doc): Doc[] {
  const query = parse(queryExpr);

  return null;
}
