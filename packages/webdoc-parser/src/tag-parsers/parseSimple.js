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

export function parseExample(value: string, options: $Shape<Doc>): Tag {
  if (!options.examples) {
    options.examples = [];
  }

  options.examples.push({caption: "", code: value});

  return {
    name: "example",
    type: "ExampleTag",
    value: "",
  };
}
