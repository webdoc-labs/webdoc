// @flow

import * as parser from "@babel/parser";
import traverse, {type NodePath} from "@babel/traverse";
import capture, {type PartialDoc, PD_VIRTUAL} from "./capture";
import mod from "./doctree-mods";
import {parserLogger} from "./Logger";
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
} from "./tag-parsers";
import {
  parseMethodDoc,
  parseTypedefDoc,
  parsePropertyDoc,
  parseEventDoc,
} from "./doc-parsers";

import {
  type ClassDoc,
  type MethodDoc,
  type Tag,
  type RootDoc,
  type Doc,
  type NSDoc,
  type ExampleTag,
} from "@webdoc/types";

import {
  createDoc,
  addChildDoc,
} from "@webdoc/model";

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
  //  isExportAllDeclaration,
  isExportDefaultDeclaration,
  isExportNamedDeclaration,
//  isExportSpecifier,
} from "@babel/types";

const babelPlugins = [
  "asyncGenerators",
  "bigInt",
  "classPrivateMethods",
  "classPrivateProperties",
  "classProperties",
  "doExpressions",
  "dynamicImport",
  "exportDefaultFrom",
  "flow",
  "flowComments",
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

function getNodeName(node: any): ?string {
  if (!node) {
    return "";
  }
  if (node.id) {
    return node.id.name;
  }
  if (node.key) {
    return node.key.name;
  }
  if (node.declarations && node.declarations.length && node.declarations[0].id) {
    return node.declarations[0].id.name;
  }
}

function createDocParser(nameHolderTag: string, docType: string) {
  return function(node, options) {
    let name = getNodeName(node);
    const ntag = options.tags.find((tag) => tag.type === "NameTag");
    const dtag = options.tags.find((tag) => tag.type === nameHolderTag);

    if (dtag && dtag.value) {
      name = dtag.value;
    } else if (!name && ntag && ntag.value) {
      name = ntag.value;
    }

    if (!name) {
      name = "<Unknown>";
    }

    return createDoc(name, docType, options);
  };
}

// These tags define what is being documented and override the actual code..
const TAG_MAP = {
  "class": createDocParser("ClassTag", "ClassDoc"),
  "interface": createDocParser("InterfaceTag", "InterfaceDoc"),
  "method": createDocParser("MethodTag", "MethodDoc"),
  "mixin": createDocParser("MixinTag", "MixinDoc"),
  "typedef": parseTypedefDoc,
  "namespace": createDocParser("NSTag", "NSDoc"),
  "event": parseEventDoc,
};

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

export const TAG_PARSERS = {
  "access": parseAccess,
  "augments": parseExtends, // alias @extends
  "event": parseEvent,
  "example": (value: string): ExampleTag => ({name: "example", code: value, value, type: "ExampleTag"}),
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

/**
 * Extracts the documentation in the code and forms a partial-doc tree.
 *
 * @param {string} file - the documented code
 * @return {PartialDoc} - the root of the partial-doc tree
 */
function partial(file: string): PartialDoc {
  const module: PartialDoc = capture.root();
  let ast;

  try {
    ast = parser.parse(file, {plugins: [...babelPlugins], sourceType: "module", errorRecovery: true});
  } catch (e) {
    console.error("Babel couldn't parse file in @webdoc/parser/parse.js#partial");
    throw e;
  }

  const stack: PartialDoc[] = [module];

  traverse(ast, {
    enter(nodePath: NodePath) {
      const node = nodePath.node;

      // Make exports transparent
      if (node.leadingComments &&
          (isExportNamedDeclaration(node) || isExportDefaultDeclaration(node)) &&
          node.declaration) {
        const declaration = nodePath.node.declaration;

        declaration.leadingComments = declaration.leadingComments || [];
        declaration.leadingComments.push(...node.leadingComments);

        // Prevent ghost docs
        node.leadingComments = [];
      }

      const scope = stack[stack.length - 1];
      const idoc = capture(nodePath.node, scope);

      if (idoc) {
        stack.push(idoc);
      }
    },
    exit(nodePath: NodePath) {
      const currentPardoc = stack[stack.length - 1];

      if (currentPardoc && currentPardoc.node === nodePath.node) {
        stack.pop();

        // Delete PD_VIRTUAL flagged partial-docs & lift up their children.
        if (currentPardoc.flags & PD_VIRTUAL) {
          const parentPardoc: PartialDoc = (currentPardoc.parent: any);

          parentPardoc.children.splice(parentPardoc.children.indexOf(currentPardoc), 1);
          parentPardoc.children.push(...currentPardoc.children);

          for (let i = 0; i < currentPardoc.children.length; i++) {
            currentPardoc.children[i].parent = parentPardoc;
          }
        }
      }
    },
  });

  if (stack.length > 1) {
    console.error("Scope erro");
  }

  return module;
}

/**
 * Transforms a {@code PartialDoc} into a {@code Doc} without touching the hierarchy.
 *
 * @param {PartialDoc} partialDoc
 * @return {?Doc}
 */
function transform(partialDoc: PartialDoc): ?Doc {
  const {comment, node} = partialDoc;

  const commentLines = comment.split("\n");

  let options: any = {node};

  if (partialDoc.options) {
    options = {...options, ...partialDoc.options};
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

      if (TAG_PARSERS.hasOwnProperty(tagName)) {
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

  for (let i = 0; i < tags.length; i++) {
    if (TAG_MAP.hasOwnProperty(tags[i].name)) {
      const doc = TAG_MAP[tags[i].name](node, options);

      if (doc) {
        return doc;
      } else {
        console.log(tags[i].name + " couldn't parse doc");
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
    return createDoc(partialDoc.name, "ClassDoc", options);
  }
  if (isClassProperty(node)) {
    return createDoc(partialDoc.name, "PropertyDoc", options);
  }
  if (isExpressionStatement(node) &&
      isMemberExpression(node.expression.left)) {
    return parsePropertyDoc(node, options);
  }
  if (isProperty(node) && isFunctionExpression(node.value)) {
    return parseMethodDoc(node, options);
  }
  if (isObjectMethod(node)) {
    return parseMethodDoc(node, options);
  }

  return null;
}

/**
 * Traverses the partial-doc tree and merges the parsed docs into the doc-tree.
 *
 * @param {Docable} partialDoc
 * @param {RootDoc} root
 */
function assemble(partialDoc: PartialDoc, root: RootDoc): void {
  const doc: Doc = transform(partialDoc);

  if (!doc && partialDoc.name !== "File") {
    partialDoc.parent = null;
    parserLogger.error("DocParser",
      `Couldn't parse doc for + ${partialDoc.name}(@${partialDoc.path.join(".")}) `);

    return;
  } else if (doc) {
    doc.members = doc.children;
  }

  const parent = partialDoc.parent ? partialDoc.parent.doc : null;

  if (doc && doc.name === undefined) {
    console.log(Object.assign({}, doc, {node: "removed"}));
    console.log("^^^ ERR");
  }

  if (parent && !doc.constructor.noInferredScope) {
    addChildDoc(doc, parent);
  } else if (partialDoc.name !== "File") {
    addChildDoc(doc, root);
  }

  partialDoc.doc = doc;

  if (partialDoc.children) {
    const children = partialDoc.children;

    for (let i = 0; i < children.length; i++) {
      assemble(children[i], root);
    }
  }
}

/**
 * Parses the file(s) into a doc-tree. This consists of the following phases:
 *
 * * Capture Phase: Documentation comments are extracted out of each file and assembled into
 *     a temporary list of partial-doc trees.
 * * Transform Phase: Each file's partial-doc tree is transformed into docs and assembled in
 *     monolithic doc-tree.
 * * Mod Phase: The "@memberof" tag is handled by moving docs to their final path;
 *     <this> member docs are moved to the appropriate scope.
 *     Plugins are allowed access to make any post-transform changes as well. Undocumented entities
 *     are removed from the doc-tree.
 *
 * @param {string | string[]} target
 * @param {RootDoc} root
 * @return {RootDoc}
 */
export function parse(target: string | string[], root?: RootDoc = {
  children: [],
  path: "",
  stack: [""],
  type: "RootDoc",
  tags: [],
}): RootDoc {
  const files = Array.isArray(target) ? target : [target];
  const partialDoctrees = new Array(files.length);

  // Capture all files
  for (let i = 0; i < files.length; i++) {
    partialDoctrees[i] = partial(files[i]);
  }

  // Recursively transform & assemble into the doc-tree (root).
  for (let i = 0; i < partialDoctrees.length; i++) {
    assemble(partialDoctrees[i], root);
  }

  mod(root);

  return root;
}
