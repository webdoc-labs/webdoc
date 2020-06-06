// @flow
import type {DataType} from "@webdoc/types";
import {IDENTIFIER} from "../constants";
import {parseDataType} from "@webdoc/model";

// Matches the first word as identifier
export function matchIdentifier(value: string): any {
  return IDENTIFIER.exec(value);
}

export function matchDataTypeClosure(value: string): any {
  return /{([^{}])+}/.exec(value);
}

// This is a helper to parse "{Type} [-] description"
export function parseTypedDescription(value: string): { dataType: DataType, description: string } {
  const refClosure = /{([^{}])+}/.exec(value);
  let dataType;
  let description;

  if (!refClosure) {
    // eslint-disable-next-line max-len
    console.warn(tag.TagParser, "@return has not defined the {OriginalType}; defaulting to {any}");
    description = value;
  } else {
    dataType = refClosure[0].slice(1, -1);
    description = value.replace(
      new RegExp(`(.{${refClosure.index}}).{${refClosure.index + refClosure[0].length}}`), "$1");
  }

  return {
    dataType: dataType ? parseDataType(dataType) : undefined,
    description,
  };
}

export const StringUtils = {
  splice(str: string, index: number, count: number, add: ?string) {
    // We cannot pass negative indexes directly to the 2nd slicing operation.
    if (index < 0) {
      index = str.length + index;
      if (index < 0) {
        index = 0;
      }
    }

    return str.slice(0, index) + (add || "") + str.slice(index + count);
  },
  del(str: string, match: any): string {
    return StringUtils.splice(str, match.index, match[0].length);
  },
};
