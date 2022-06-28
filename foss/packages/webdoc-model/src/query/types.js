// @flow

export type Op =
  "=" |
  ">=" |
  "<=" |
  ">" |
  "<" |
  "";

export type AttributeName = string;

export type AttributeValue = string;

export type VariantCondition = {
  op: Op,
  attribute: AttributeName,
  value: AttributeValue
};

export type VariantExpr = {
  conditions: VariantCondition[]
};

export type StepType =
  "member" |
  "instance-member" |
  "inner-member" |
  "r-member";

export type StepExpr = {
  variant?: VariantExpr,
  qualifier: string,
  type: StepType
};

export type QueryExpr = {
  steps: StepExpr[]
};
