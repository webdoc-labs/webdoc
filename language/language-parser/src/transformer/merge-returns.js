import type {Return} from "@webdoc/types";

// This file merges the possible returns for a function/method. The metadata can
// only contain the first return-type so this is a simpler algorithm than merge-params.

export default function mergeReturns(docReturns: Return[], metaReturns: Return[]): Return[] {
  if (!docReturns || !metaReturns || !metaReturns.length) {
    return docReturns || metaReturns;
  }

  if (docReturns[0]) {
    docReturns[0].dataType = docReturns[0].dataType || metaReturns[0].dataType;
  } else {
    docReturns[0] = metaReturns[0];
  }

  return docReturns;
}
