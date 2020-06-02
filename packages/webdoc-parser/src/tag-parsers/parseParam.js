// @flow

import type {Doc, ParamTag} from "@webdoc/types";

// @param {<DATA_TYPE>} <NAME>                      - <DESC>
// @param {<DATA_TYPE>} [<NAME>]                    - <DESC>
// @param {<DATA_TYPE>} [<NAME>=<DEFAULT_VALUE>]    - <DESC>

// Extracts the parameter's identifier & related information that occurs after the type
function extractidentifier(from: string, index: number = 0): {
  identifier: string,
  optional: boolean,
  default?: string,
  variadic?: boolean,
  closureStart: number,
  closureEnd: number
  } {
  // Extracts the [ident=defaultValue] group. The brackets & equal sign need not exist.
  const identClosureMatch = /((\[)([^\]])+(\]))|(\S)+/.exec(from);

  if (!identClosureMatch) {
    return {
      identifier: `arg${index}`,
      optional: false,
      closureStart: 0,
      closureEnd: 0,
    };
  }

  const identClosure = identClosureMatch[0];

  const extracted = {
    closureStart: identClosureMatch.index,
    closureEnd: identClosureMatch.index + identClosure.length,
  };

  if (identClosure.startsWith("[") && identClosure.endsWith("]")) {// [...] block exists
    const closureContent = identClosure.slice(1, -1).trim();
    const splitIndex = closureContent.indexOf("=");
    const variadic = closureContent.startsWith("...");

    if (splitIndex === -1) {// No "=" sign implies no default value
      return {
        ...extracted,
        identifier: closureContent,
        optional: true,
        variadic,
      };
    } else {
      return {
        ...extracted,
        identifier: closureContent.slice(0, splitIndex),
        optional: true,
        default: closureContent.slice(splitIndex + 1),
        variadic,
      };
    }
  }

  // Remove included space
  extracted.closureEnd -= 1;

  return {
    ...extracted,
    identifier: identClosure,
    optional: false,
    variadic: identClosure.startsWith("..."),
  };
}

// Parses a ParamTag from a string
export function parseParam(value: string, options: $Shape<Doc>): ParamTag {
  // Finds the {Type} closure,
  const refClosure = /{([^{}])+}/.exec(value);

  // We delete stuff that is parsed from the value, and this is leftover
  let extractable = value;

  let ref;

  if (refClosure) {
    ref = refClosure[0].slice(1, -1);
    extractable = extractable.replace(
      new RegExp(`(.{${refClosure.index}}).{${refClosure.index + refClosure[0].length}}`), "$1");
  } else {
    ref = "any";
  }

  const identClosure = extractidentifier(extractable);

  extractable = extractable.replace(
    new RegExp(`(.{${identClosure.closureStart}}).{${identClosure.closureEnd}}`), "$1");
  extractable = extractable.trim();

  if (extractable.startsWith("-") && extractable !== "") {
    extractable = extractable.slice(1);
    extractable = extractable.trimStart();
  } else if (extractable) {
    console.warn(`[TagParser]: ${identClosure.identifier} does not have a "-" token preceeding description`);
  }

  if (!options.params) {
    options.params = [];
  }

  options.params.push({
    identifier: identClosure.identifier,
    referred: ref,
    description: extractable,
    optional: identClosure.optional,
    default: identClosure.default,
    variadic: identClosure.variadic,
  });

  return {
    name: "param",
    value,
    type: "ParamTag",
    referred: ref,
    description: extractable,
    identifier: identClosure.identifier,
    optional: identClosure.optional,
    default: identClosure.default,
    variadic: identClosure.variadic,
  };
}
