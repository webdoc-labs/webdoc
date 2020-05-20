// @flow
// This file converts Symbols into Docs (i.e. parses the documentation comments and infers the type
// of symbol)

import {
  isExpressionStatement,
  isClassDeclaration,
  isClassMethod,
  isMemberExpression,
  isClassProperty,
  isClassExpression,
  isProperty,
  isObjectMethod,
  isFunctionExpression,
  isFunctionDeclaration,
} from "@babel/types";

import {
  parseParam,
  parsePrivate,
  parseProtected,
  parsePublic,
  parseTypedef,
  parseAccess,
  parseStatic,
  parseInner,
  parseInstance,
  parseScope,
  parseReturn,
  parseMember,
  parseEvent,
  parseFires,
  parseProperty,
  parseExtends,
  parseImplements,
  parseMixes,
  parseDeprecated,
} from "./tag-parsers";

import {
  parseMethodDoc,
  parsePropertyDoc,
  parseEventDoc,
} from "./doc-parsers";

import type {Tag, Doc, ExampleTag} from "@webdoc/types";
import {createDoc} from "@webdoc/model";

type TagParser = (value: string, options: Object) => void;

// This is used to generate a BaseTag parser with no special features.
// @name, @class, @interface, @mixin
function createTagParser(type: string) {
  return function(value: string) {
    return {
      value,
      type,
    };
  };
}

// @tag parsers
const TAG_PARSERS: { [id: string]: TagParser } = {
  "access": parseAccess,
  "augments": parseExtends, // alias @extends
  "deprecated": parseDeprecated,
  "event": parseEvent,
  "example": (value: string): ExampleTag =>
    ({name: "example", code: value, value, type: "ExampleTag"}),
  "extends": parseExtends,
  "fires": parseFires,
  "inner": parseInner,
  "instance": parseInstance,
  "interface": createTagParser("InterfaceTag"),
  "implements": parseImplements,
  "member": parseMember,
  "method": createTagParser("MethodTag"),
  "mixes": parseMixes,
  "mixin": createTagParser("MixinTag"),
  "namespace": createTagParser("NSTag"),
  "param": parseParam,
  "property": parseProperty,
  "protected": parseProtected,
  "private": parsePrivate,
  "public": parsePublic,
  "return": parseReturn,
  "returns": parseReturn, // alias @return
  "scope": parseScope,
  "static": parseStatic,
  "tag": (name: string, value: string): Tag => ({name, value}),
  "typedef": parseTypedef,
};

// These tags define what is being documented and override the actual code..
const TAG_OVERRIDES: { [id: string]: string | any } = { // replace any, no lazy
  "class": "ClassDoc",
  "interface": "InterfaceDoc",
  "enum": parsePropertyDoc,
  "member": parsePropertyDoc,
  "method": parseMethodDoc,
  "mixin": "MixinDoc",
  "typedef": "TypedefDoc",
  "namespace": "NSDoc",
  "event": parseEventDoc,
};

export default function buildDoc(symbol: Symbol): ?Doc {
  const {comment, node} = symbol;

  const commentLines = comment.split("\n");

  let options: any = {node};

  if (symbol.options) {
    options = {...options, ...symbol.options};
  }

  const tags: Tag[] = [];
  let brief = "";
  let description = "";
  let noBrief = false;

  for (let i = 0; i < commentLines.length; i++) {
    if (commentLines[i].trimStart().startsWith("@")) {
      const tokens = commentLines[i].trim().split(" ");
      const tagName = tokens[0].replace("@", "");

      let value = tokens.slice(1).join(" ");

      for (let j = i + 1; j < commentLines.length; j++) {
        if (commentLines[j].trim().startsWith("@") || !commentLines[j]) {
          break;
        }

        ++i;
        value += "\n" + commentLines[i];
      }

      let tag;

      if (TAG_PARSERS.hasOwnProperty(tagName)) {// eslint-disable-line no-prototype-builtins
        tag = (TAG_PARSERS[tagName](value, options));
      } else {
        tag = (TAG_PARSERS["tag"](tagName, value));
      }

      if (tag && !tag.name) {
        tag.name = tagName;
      }

      tags.push(tag);
    } else if (commentLines[i]) {
      if (!brief && !commentLines[i + 1] && !noBrief) {
        brief = `${commentLines[i]}`;
      } else {
        description += `${commentLines[i]}\n`;
      }

      noBrief = true;
    }
  }

  options.tags = tags;
  options.brief = brief;
  options.description = description;
  options.node = null;

  // @name might come handy
  if (!symbol.name) {
    const nameTag = tags.find((tag) => tag.name === "name");

    if (nameTag) {
      symbol.name = nameTag.value;
    }
  }

  if (isExpressionStatement(node) && isMemberExpression(node.expression.left)) {
    return parsePropertyDoc(node, options);
  }

  for (let i = 0; i < tags.length; i++) {
    if (TAG_OVERRIDES.hasOwnProperty(tags[i].name)) {// eslint-disable-line no-prototype-builtins
      const name = tags[i].name;
      const override = TAG_OVERRIDES[name];
      let doc;

      if (typeof override === "string") {
        doc = createDoc(tags[i].value || symbol.name, TAG_OVERRIDES[name], options);
      } else {
        symbol.name = symbol.name || tags[i].value;

        if (symbol.name) {
          options.name = symbol.name;
        }

        doc = override(node, options);
      }

      if (doc) {
        return doc;
      } else {
        console.log(tags[i].name + " couldn't parse doc for ");
        // console.log(symbol.node);
      }
    }
  }
  if (!node) {
    return null;
  }

  if (isClassMethod(node)) {
    return parseMethodDoc(node, options);
  }
  if (isClassDeclaration(node) || isClassExpression(node)) {
    return createDoc(symbol.name, "ClassDoc", options);
  }
  if (isClassProperty(node)) {
    return createDoc(symbol.name, "PropertyDoc", options);
  }
  if (isFunctionDeclaration(node)) {
    return createDoc(symbol.name, "FunctionDoc", options);
  }
  if (isProperty(node) && isFunctionExpression(node.value)) {
    return parseMethodDoc(node, options);
  }
  if (isObjectMethod(node)) {
    return parseMethodDoc(node, options);
  }

  console.log(symbol.name + " couldn't be resolved");

  return null;
}
