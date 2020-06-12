// @flow
/** global Webdoc */

import type {Doc} from "@webdoc/types";
import {parserLogger} from "../Logger";
import {traverse} from "@webdoc/model";

const ACCESS_ORDER = {
  "public": 0,
  "protected": 1,
  "private": 2,
  [undefined]: 0,
};

const SCOPE_ORDER = {
  "static": 0,
  "instance": 1,
  "inner": 2,
  [undefined]: 0,
};

const TYPE_ORDER = {
  "NSDoc": 1,
  "ClassDoc": 2,
  "EnumDoc": 3,
  "TypedefDoc": 4,
  "PropertyDoc": 5,
  "MethodDoc": 6,
  "EventDoc": 7,
  [undefined]: 10,
};

const collator = new Intl.Collator();

const PROP_COMPARATORS = {
  "name": (d0, d1) => collator.compare(d0.name, d1.name),
  "access": (d0, d1) => (ACCESS_ORDER[d0.access || "public"]) - (ACCESS_ORDER[d1.access || "public"]),
  "scope": (d0, d1) => (SCOPE_ORDER[d0.scope || "inner"]) - (SCOPE_ORDER[d1.scope || "inner"]),
  "type": (d0, d1) => (TYPE_ORDER[d0.type] || 10) - (TYPE_ORDER[d1.type] || 10),
};

// This mod sorts each doc's members using a list of properties in order of decreasing
// precedence.
//
// The supported props are: "access", "scope", "type", "name"
//
// You can also use "source" on its own (no other properties).
export default function sort(rootDoc: Doc): void {
  let sortBasis;

  try {
    sortBasis = global.Webdoc.userConfig.docs.sort;
  } catch (e) {
    parserLogger.info("DocumentTreeModifier", "Couldn't find sorting basis");
    return;
  }

  // The doc-tree is sorted by source already
  if (!sortBasis || sortBasis.startsWith("source")) {
    return;
  }

  // Extract the doc properties used for sorting
  const props = sortBasis.split(",").map((prop) => prop.trim());

  // Ensure all props are supported
  props.forEach((prop) => {
    if (!PROP_COMPARATORS[prop]) {
      throw new Error(`@webdoc/parser does not support sorting docs based on '${prop}'`);
    }
  });

  // Generate a function that will compare two docs based off of these properties
  const comparator = generateComparator(props);

  // Traverse the doc-tree and sort each doc's members using the comparator
  traverse(rootDoc, (doc) => {
    if (!doc.members.length) {
      return;
    }

    doc.members.sort(comparator);
  });
}

function generateComparator(props) {
  const len = props.length;

  return function(d0, d1) {
    for (let i = 0; i < len; i++) {
      const result = PROP_COMPARATORS[props[i]](d0, d1);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
}
