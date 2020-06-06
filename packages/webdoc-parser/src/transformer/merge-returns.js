import type {Return} from "@webdoc/types";

// This file merges the possible returns for a function/method. The metadata can
// only contain the first return-type so this is a simpler algorithm than merge-params.

export default function mergeReturns(docReturns: Return[], metaReturns: Return[]): Return[] {
  if (!docReturns || !metaReturns) {
    return docReturns || metaReturns;
  }

  // ASSUMPTION: docReturns & metaReturns have atleast one Return

  docReturns[0].dataType = docReturns[0].dataType || metaReturns[0].dataType;

  return docReturns;
}
