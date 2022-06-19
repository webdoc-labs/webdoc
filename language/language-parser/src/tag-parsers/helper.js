// @flow
import type {DataType} from "@webdoc/types";
import {IDENTIFIER} from "../constants";
import {parseDataType} from "@webdoc/model";

// Alias for RegEx matches & our own match function results
type MatchResult = string[] & { index: number }

// Matches the first word as identifier
export function matchIdentifier(value: string): any {
  return IDENTIFIER.exec(value);
}

export function matchDataTypeClosure(value: string): any {
  return /{([^{}])+}/.exec(value);
}

// Find the RegEx match for "[defaultValueClosureContent]" inside "value", starting at "start",
// and stopping before the "-" token (description prefix) if "beforeDesc" is true
export function matchDefaultValueClosure(
  value: string,
  start: number = 0,
  beforeDesc: boolean = true,
): ?MatchResult {
  // Tracks how many opening brackets we are inside of
  // [_ = 1
  // [[_ = 2
  // [[]_ = 1
  let bracketDepth = 0;

  // Index at which first opening bracket was found
  let openIndex = -1;

  // Index at which last closing bracket was found
  let closeIndex;

  for (let i = start, j = value.length; i < j; i++) {
    const char = value.charAt(i);

    if (char === "[") {
      ++bracketDepth;

      if (openIndex < 0) {
        openIndex = i;
      }
    } else if (char === "]") {
      --bracketDepth;

      if (bracketDepth === 0) {
        closeIndex = i;
        break;
      }
    } else if (beforeDesc && char === "-" && bracketDepth === 0) {
      return;
    }
  }

  // $FlowFixMe
  const result: $Shape<MatchResult> = [value.slice(openIndex, closeIndex + 1)];

  result.index = openIndex;

  return result;
}

// This is a helper to parse "{Type} [-] description"
export function parseTypedDescription(
  value: string,
): {
  dataType?: ?DataType,
  description: string
} {
  const refClosure = /{([^{}])+}/.exec(value);
  let dataType;
  let description;

  if (!refClosure) {
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
