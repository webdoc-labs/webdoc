// @flow

import * as parser from "@babel/parser";
import type {Node} from "@babel/types";

// Plugins for plain JavaScript files
const defaultPreset = [
  "asyncGenerators",
  "bigInt",
  "classPrivateMethods",
  "classPrivateProperties",
  "classProperties",
  "doExpressions",
  "dynamicImport",
  "exportDefaultFrom",
  "functionBind",
  "functionSent",
  "importMeta",
  "jsx",
  "logicalAssignment",
  "nullishCoalescingOperator",
  "numericSeparator",
  "objectRestSpread",
  "optionalCatchBinding",
  "optionalChaining",
  "throwExpressions",
];

// Plugins for JS+Flow files
const flowPreset = [
  ...defaultPreset,
  "flow",
  "flowComments",
];

// Plugins for TypeScript files
const tsPreset = [
  ...defaultPreset,
  "typescript",
];

// Wrapper around @babel/parser that auto-detects the configuration needed!
export default function parseBabel(file: string, fileName: ?string) {
  const fileExt = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);

  let plugins;

  if (fileExt == "ts" || fileExt === "tsx") {
    plugins = tsPreset;
  } else {
    // flowPreset can also handle plain JavaScript so no need to check for /** @flow */ declaration
    plugins = flowPreset;
  }

  let ast;

  try {
    ast = parser.parse(file, {
      plugins,
      sourceType: "module",
      errorRecovery: true,
    });
  } catch (e) {
    console.error(`Babel couldn't parse file ${fileName} in @webdoc/parser`);
    throw e;
  }

  return ast;
}
