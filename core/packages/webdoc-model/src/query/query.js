// @flow

import type {Doc} from "@webdoc/types";
import type {QueryExpr} from "./types";
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
export function query(queryExpr: string | QueryExpr, docTree: Doc): Doc[] {
  queryExpr = typeof queryExpr === "string" ? parse(queryExpr) : queryExpr;
  let results: Doc[] = [docTree];

  queryExpr.steps.forEach((stepExpr) => {
    results = results
      .flatMap((doc) => step(stepExpr, doc))
      .filter((doc) => stepExpr.variant ? variant(stepExpr.variant, doc) : true);
  });

  return results;
}
