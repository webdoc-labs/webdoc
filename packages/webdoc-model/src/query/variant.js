// @flow

import {VariantCondition, VariantExpr} from "./types";
import {Doc} from "@webdoc/types";

const operatorEngines = {
  "=": (a, b) => (a === b),
  ">=": (a, b) => (a >= b),
  "<=": (a, b) => (a <= b),
  ">": (a, b) => (a > b),
  "<": (a, b) => (a < b),
};

function condition(conditionClause: VariantCondition, doc: Doc): boolean {
  const attributeValue = doc[conditionClause.attribute];
  const conditionValue = conditionClause.value;

  operatorEngines[conditionClause.op](attributeValue, conditionValue);
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
