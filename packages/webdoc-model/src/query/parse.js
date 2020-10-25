// @flow
// This file parses a raw query into a query model, as typed in types.js

import type {
  QueryExpr,
  StepExpr,
  StepType,
  VariantCondition,
  VariantExpr,
} from "./types";

// Regex to match step expression delimiters.
const STEP_EXPR_DELIMITER = /(?:[.][.][.])|(?:[.#~])/g;

// Regex to match variant expressions: [contents]
const VARIANT_EXPR = /\[([^\]]+)\]/g;

// Condition operators
const OP = /(?:=)|(?:>=)|(?:<=)|(?:>)|(?:<)/g;

function parseCondition(condition: string): VariantCondition {
  const opPattern = new RegExp(OP).exec(condition);

  const op = opPattern ? opPattern[0] : "";
  const [attribute, value] = condition.split(OP);

  return {
    op,
    attribute,
    value,
  };
}

// Parses a variant expression, without the enclosing brackets.
function parseVariantExpr(variantExpr: string): VariantExpr {
  const conditionList = variantExpr.split(",");
  const conditions = conditionList.map((conditionExpr) => parseCondition(conditionExpr));

  return {
    conditions,
  };
}

// Maps the step delimiter to its step-type qualifier.
function parseStepType(delimiterPrefix: string): StepType {
  switch (delimiterPrefix) {
  case "#": return "instance-member";
  case "~": return "inner-member";
  case "...": return "r-member";
  case ".":
  default:
    return "member";
  }
}

// Parses a step expression into a StepExpr object.
function parseStepExpr(stepExpr: string, delimiterPrefix: string): StepExpr {
  const type = parseStepType(delimiterPrefix);
  const variantExpr = new RegExp(VARIANT_EXPR).exec(stepExpr);
  const qualifier = stepExpr.replace(VARIANT_EXPR, "");

  return {
    qualifier,
    type,
    variant: variantExpr ? parseVariantExpr(variantExpr[1]) : undefined,
  };
}

// Parses a DPL query expression into a QueryExpr object.
export function parse(queryExpr: string): QueryExpr {
  if (queryExpr[0] !== "." &&
       queryExpr[0] !== "#" &&
       queryExpr[0] !== "~") {
    queryExpr = `...${queryExpr}`;
  }

  const stepDelimiterList = queryExpr.match(STEP_EXPR_DELIMITER);
  const stepExprList = queryExpr.split(STEP_EXPR_DELIMITER);

  stepExprList.shift();

  const steps = stepExprList.map((stepExpr, i) => parseStepExpr(stepExpr, stepDelimiterList[i]));

  return {
    steps,
  };
}
