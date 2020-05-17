// @flow
import type {DataType} from "@webdoc/types";

// This is a helper to parse "{Type} [-] description"
export function parseTypedDescription(value: string): { dataType: DataType, description: string } {
  const refClosure = /{([^{}])+}/.exec(value);
  let dataType = "any";
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
    dataType: [dataType, dataType],
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
};
