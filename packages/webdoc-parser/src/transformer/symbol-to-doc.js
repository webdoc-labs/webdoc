// @flow
// This file converts Symbols into Docs (i.e. parses the documentation comments)

// TODO: Give some sympathy to the code here & organize it out

import type {Doc, Tag} from "@webdoc/types";
import type {Symbol, SymbolSignature} from "../types/Symbol";
import {
  parseAccess,
  parseAuthor,
  parseCopyright,
  parseDefault,
  parseDeprecated,
  parseEnum,
  parseEvent,
  parseExample,
  parseExtends,
  parseFires,
  parseImplements,
  parseInner,
  parseInstance,
  parseLicense,
  parseMember,
  parseMixes,
  parseName,
  parseParam,
  parsePrivate,
  parseProperty,
  parseProtected,
  parsePublic,
  parseReturn,
  parseScope,
  parseSee,
  parseSince,
  parseStatic,
  parseThrows,
  parseTodo,
  parseType,
  parseTypedef,
} from "../tag-parsers";
import {createDoc} from "@webdoc/model";
import mergeParams from "./merge-params";
import mergeReturns from "./merge-returns";
import validate from "../validators";

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
  "author": parseAuthor,
  "copyright": parseCopyright,
  "default": parseDefault,
  "deprecated": parseDeprecated,
  "enum": parseEnum,
  "event": parseEvent,
  "example": parseExample,
  "extends": parseExtends,
  "fires": parseFires,
  "inner": parseInner,
  "instance": parseInstance,
  "interface": createTagParser("InterfaceTag"),
  "implements": parseImplements,
  "license": parseLicense,
  "member": parseMember,
  "method": createTagParser("MethodTag"),
  "mixes": parseMixes,
  "mixin": createTagParser("MixinTag"),
  "name": parseName,
  "namespace": createTagParser("NSTag"),
  "param": parseParam,
  "property": parseProperty,
  "protected": parseProtected,
  "private": parsePrivate,
  "public": parsePublic,
  "return": parseReturn,
  "returns": parseReturn, // alias @return
  "scope": parseScope,
  "see": parseSee,
  "since": parseSince,
  "static": parseStatic,
  "tag": (name: string, value: string): Tag => ({name, value}),
  "todo": parseTodo,
  "throws": parseThrows,
  "type": parseType,
  "typedef": parseTypedef,
};

// These tags define what is being documented and override the actual code..
const TAG_OVERRIDES: { [id: string]: string | any } = { // replace any, no lazy
  "class": "ClassDoc",
  "interface": "InterfaceDoc",
  //  "enum": "PropertyDoc",
  "member": "PropertyDoc",
  "method": "MethodDoc",
  "mixin": "MixinDoc",
  "typedef": "TypedefDoc",
  "namespace": "NSDoc",
  "event": "EventDoc",
};

// Tags that end only when another tag is found or two lines are blank for consecutively
const TAG_BLOCKS = new Set(["example", "classdesc"]);

export default function symbolToDoc(symbol: Symbol): ?Doc {
  const {comment, node} = symbol;

  const commentLines = (comment || "").split("\n");

  const options: any = {node};

  options.access = symbol.meta.access;
  options.scope = symbol.meta.scope;

  options.parserOpts = {
    object: symbol.meta.object,
    undocumented: symbol.meta.undocumented,
  };

  const tags: Tag[] = [];
  let brief = "";
  let description = "";
  let noBrief = false;

  // Extract all the tags in the documentation
  for (let i = 0; i < commentLines.length; i++) {
    if (commentLines[i].trimStart().startsWith("@")) {
      const tokens = commentLines[i].trim().split(" ");
      const tagName = tokens[0].replace("@", "");
      const isBlock = TAG_BLOCKS.has(tagName);

      let value = tokens.slice(1).join(" ");
      let blankLines = 0;
      const blankLimit = isBlock ? 2 : 1;

      for (let j = i + 1; j < commentLines.length; j++) {
        if (commentLines[j].trim().startsWith("@")) {
          break;
        }
        if (!commentLines[j]) {
          ++blankLines;
        } else {
          blankLines = 0;
        }

        if (blankLines >= blankLimit) {
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
    } else {
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

  options.extends = options.extends || symbol.meta.extends;
  options.implements = options.implements || symbol.meta.implements;
  options.typeParameters = options.typeParameters || symbol.meta.typeParameters;

  // @name might come handy
  if (!symbol.simpleName) {
    const nameTag = tags.find((tag) => tag.name === "name");

    if (nameTag) {
      symbol.simpleName = nameTag.value;
    }
  }

  for (let i = 0; i < tags.length; i++) {
    if (TAG_OVERRIDES.hasOwnProperty(tags[i].name)) {// eslint-disable-line no-prototype-builtins
      const name = tags[i].name;

      if (!options.name && !tags[i].value && !symbol.simpleName) {
        continue;
      }

      const doc = createDoc(
        options.name || tags[i].value || symbol.simpleName,
        TAG_OVERRIDES[name],
        options,
        symbol);

      infer(doc, symbol.meta);

      delete doc.comment;
      delete doc.flags;
      delete doc.node;
      delete doc.meta;
      delete doc.options;
      delete doc.parent;

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

  try {
    validate(options, symbol.meta);
  } catch (e) {
    console.error(`Validation for ${symbol.simpleName} [${symbol.canonicalName}] failed!`);
    throw e;
  }

  if (symbol.simpleName && symbol.meta && symbol.meta.type) {
    // This will transform "symbol" into "doc" (a new object is not created)
    const doc = createDoc(symbol.simpleName, symbol.meta.type, options, symbol);

    infer(doc, symbol.meta);

    // Remove properties from Symbol form
    delete doc.comment;
    delete doc.flags;
    delete doc.node;
    delete doc.meta;
    delete doc.options;
    delete doc.parent;

    return doc;
  } else {
    console.log(symbol.simpleName + " -<");
  }

  return null;
}

// Infer everything we can from the metadata
function infer(doc: Doc, meta: SymbolSignature) {
  doc.params = mergeParams(doc.params, meta.params);
  doc.returns = mergeReturns(doc.returns, meta.returns);
  doc.extends = doc.extends || meta.extends;
  doc.implements = doc.implements || meta.implements;
  doc.typeParameters = doc.typeParameters || meta.typeParameters;
}
