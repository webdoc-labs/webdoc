// @flow
// This file converts Symbols into Docs (i.e. parses the documentation comments and infers the type
// of symbol)

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
  parseExample,
} from "./tag-parsers";

import type {Tag, Doc, ExampleTag} from "@webdoc/types";
import {createDoc} from "@webdoc/model";

import type {Symbol, SymbolSignature} from "./build-symbol-tree";

import mergeWith from "lodash/mergeWith";

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
  "example": parseExample,
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
  "enum": "PropertyDoc",
  "member": "PropertyDoc",
  "method": "MethodDoc",
  "mixin": "MixinDoc",
  "typedef": "TypedefDoc",
  "namespace": "NSDoc",
  "event": "EventDoc",
};

// Tags that end only when another tag is found or two lines are blank for consecutively
const TAG_BLOCKS = new Set(["example", "classdesc"]);

export default function buildDoc(symbol: Symbol): ?Doc {
  const {comment, node} = symbol;

  const commentLines = comment.split("\n");

  const options: any = {node};

  options.access = symbol.meta.access;
  options.scope = symbol.meta.scope;

  options.parserOpts = {
    object: symbol.meta.object,
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

  // if (symbol.meta.object)

  // @name might come handy
  if (!symbol.name) {
    const nameTag = tags.find((tag) => tag.name === "name");

    if (nameTag) {
      symbol.name = nameTag.value;
    }
  }

  for (let i = 0; i < tags.length; i++) {
    if (TAG_OVERRIDES.hasOwnProperty(tags[i].name)) {// eslint-disable-line no-prototype-builtins
      const name = tags[i].name;
      const override = TAG_OVERRIDES[name];
      let doc;

      // if (typeof override === "string") {
      doc = createDoc(tags[i].value || symbol.name, TAG_OVERRIDES[name], options, symbol);
      delete doc.comment;
      delete doc.flags;
      delete doc.node;
      delete doc.meta;
      delete doc.options;
      delete doc.parent;

      // }

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

  verifyParameters(options, symbol.meta);

  mergeWith(options, symbol.meta, (optVal, metaVal) => optVal === undefined ? metaVal : optVal);

  if (symbol.name && symbol.meta && symbol.meta.type) {
    // This will transform "symbol" into "doc" (a new object is not created)
    const doc = createDoc(symbol.name, symbol.meta.type, options, symbol);

    // Remove properties from Symbol form
    delete doc.comment;
    delete doc.flags;
    delete doc.node;
    delete doc.meta;
    delete doc.options;
    delete doc.parent;

    return doc;
  } else {
    console.log(symbol.name + " -<");
  }
  return null;
}

function verifyParameters(doc: $Shape<Doc>, meta: SymbolSignature): void {
  if (!meta.params || !doc.params) {
    return;
  }

  let lastParam = null;

  for (let i = 0, j = 0; i < doc.params.length; i++) {
    const param = doc.params[i];
    const name = param.identifier;

    const dotIndex = name.indexOf(".");

    if (dotIndex >= 0) {
      const firstId = name.slice(0, dotIndex);

      // The following order is illegal. options.title must come right after options.
      // @param {object} options
      // @param {string} string
      // @param {string} options.title
      if (firstId !== lastParam) {
        throw new Error(`Object property ${name} parameter must be placed` +
              `directly after object parameter ${firstId}`);
      }

      continue;
    }
    if (j >= meta.params.length) {
      throw new Error(`"${name}" is not a parameter & cannot` +
            ` come after the last parameter "${lastParam}"`);
    }

    ++j;
    lastParam = name;
  }
}
