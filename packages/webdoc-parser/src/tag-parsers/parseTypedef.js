// @flow
import type {TypedefTag} from "@webdoc/types";
import {parserLogger, tag} from "../Logger";
import {parseDataType} from "@webdoc/model";

// @typedef {<DATA_TYPE>} <NAME>

// Parse the "@typedef {of} alias" tag
export function parseTypedef(value: string, options: any): TypedefTag {
  // Get {ReferredType}
  const refClosure = /{([^{}])+}/.exec(value);
  let of;
  let alias;

  if (!refClosure) {
    // eslint-disable-next-line max-len
    parserLogger.warn(tag.TagParser, "@typedef has not defined the {OriginalType}; defaulting to {any}");
    alias = value;
  } else {
    of = refClosure[0].slice(1, -1);
    alias = value.replace(
      new RegExp(`(.{${refClosure.index}}).{${refClosure.index + refClosure[0].length}}`), "$1");
  }

  options.dataType = of ? parseDataType(of) : undefined;
  options.alias = alias;
  options.name = alias;

  return {
    name: "typedef",
    dataType: [of],
    alias,
    type: "TypedefTag",
  };
}
