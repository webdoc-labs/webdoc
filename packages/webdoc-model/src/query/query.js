// @flow

import type {Doc} from "@webdoc/types";
import type {Query} from "./types";
import {parse} from "./parse";
import {step} from "./step";
import {variant} from "./variant";

/**
 * Runs a query in the document tree and returns the matching document, according to the
 * Document Path Langugage expression {@code query}.
 *
 * @param {string} queryExpr - The query expression.
 * @param {Doc} docTree - The root of the document tree to be queried.
 * @return {Doc[]} The list of documents matching the query.
 */
export function query(queryExpr: string | Query, docTree: Doc): Doc[] {
  queryExpr = typeof queryExpr === "string" ? parse(queryExpr) : queryExpr;
  let results: Doc[] = [];

  queryExpr.steps.forEach((stepExpr) => {
    results = results
      .flatMap((doc) => step(stepExpr, doc))
      .filter((doc) => variant(doc));
  });

  return results;
}
