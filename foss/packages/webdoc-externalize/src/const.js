import type {BaseDoc, Param} from "@webdoc/types";

// NOTE: "description" is truncated so it should not be in these lists.

// Props that are copied from all documents, without any restrictions.
export const BASE_PROPS: Array<$Keys<BaseDoc>> = [
  "id",
  "name",
  "brief",
  "abstract",
  "access",
  "authors",
  "copyright",
  "defaultValue",
  "deprecated",
  "examples",
  "license",
  "readonly",
  "scope",
  "see",
  "since",
  "type",
  "version",
];

// Props that hold document links
export const LINK_PROPS = [
  "extends",
  "implements",
  "mixes",
];

// Props from params to be copied without serialization
export const PARAM_PROPS: Array<$Keys<Param>> = [
  "identifier",
  "optional",
  "default",
  "variadic",
];
