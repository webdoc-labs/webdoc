// @flow

import type {VariantCondition, VariantExpr} from "./types";
import type {Doc} from "@webdoc/types";

const operatorEngines = {
  "=": (a, b) => {
    // DataType comparison
    if (Array.isArray(a) && a.template && typeof b === "string") {
      return a[0] === b;
    }

    return a === b;
  },
  ">=": (a, b) => (a >= b),
  "<=": (a, b) => (a <= b),
  ">": (a, b) => (a > b),
  "<": (a, b) => (a < b),
  "": (a, b) => true,
};

const SUBINDEX = /([^\n]+)\[([^\n]+)\]$/;

function attribute(doc: any, attrib: string): any {
  const result = attrib.match(SUBINDEX);

  if (result !== null) {
    const [, parentAttribute, index] = result;
    const parentValue = attribute(doc, parentAttribute);

    if (typeof parentValue === "object" && typeof index === "string") {
      return parentValue[index];
    }
  }

  return doc[attrib];
}

function condition(conditionClause: VariantCondition, doc: Doc): boolean {
  const attributeValue: any = attribute(doc, conditionClause.attribute);
  const conditionValue: any = conditionClause.value;

  return operatorEngines[conditionClause.op](attributeValue, conditionValue);
}

// Evaluates all variant conditionsa and returns whether the doc passes them.
export function variant(variantExpr: VariantExpr, doc: Doc): boolean {
  if (!variantExpr) {
    return true;
  }

  for (let i = 0, j = variantExpr.conditions.length; i < j; i++) {
    if (!condition(variantExpr.conditions[i], doc)) {
      return false;
    }
  }

  return true;
}
