// @flow
import type {Doc, Tag} from "@webdoc/types";
import {parserLogger} from "../Logger";

export function parseDeprecated(value: string, options: $Shape<Doc>): Tag {
  if (value.trim() !== "") {
    parserLogger.warn("TagParser", "@deprecated does not accept any value");
  }

  options.deprecated = true;

  return {
    name: "deprecated",
    type: "DeprecatedTag",
    value: "",
  };
}
