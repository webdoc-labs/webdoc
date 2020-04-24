// @flow

import * as parser from "@babel/parser";
import traverse, {type NodePath} from "@babel/traverse";
import capture, {type PartialDoc} from "./capture";
import mod from "./doctree-mods";

import {
  type ClassDoc,
  type MethodDoc,
  type Tag,
  type RootDoc,
  type Doc,
  type MemberTag,
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
  isThisExpression,
  isClassProperty,
  isClassExpression,
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

function getNodeName(node: any): string {
  if (node.id) {
    return node.id.name;
  }
  if (node.key) {
    return node.key.name;
  }

  return "<Unknown>";
}

// These tags define what is being documented and override the actual code.
const TAG_MAP = {
  "class": (node, options): ClassDoc => createDoc(getNodeName(node), "ClassDoc", options),
  "method": (node, options): MethodDoc => createDoc(getNodeName(node), "MethodDoc", options),
  // "typedef": (options) => ({...options, name: "tbh", type: "TypedefDoc"}),
};

// TODO: These parse the tag's contents and fill and special fields
export const TAG_PARSERS = {
  "member": (name: string, value: string): MemberTag => ({name, value}),
  "tag": (name: string, value: string): Tag => ({name, value}),
};

/**
 * Extracts the documentation in the code and forms a partial-doc tree.
 *
 * @param {string} file - the documented code
 * @return {PartialDoc} - the root of the partial-doc tree
 */
function partial(file: string): PartialDoc {
  const module: PartialDoc = capture.root();
  const ast = parser.parse(file, {plugins: [...babelPlugins]});
  const stack: PartialDoc[] = [module];

  traverse(ast, {
    enter(nodePath: NodePath) {
      const scope = stack[stack.length - 1];
      const idoc = capture(nodePath.node, scope);

      if (idoc) {
        stack.push(idoc);
      }
    },
    exit(nodePath: NodePath) {
      const currentPtr = stack[stack.length - 1];

      if (currentPtr && currentPtr.node === nodePath.node) {
        // currentPtr.node = null;
        stack.pop();
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

  const tags: Tag[] = [];

  for (let i = 0; i < commentLines.length; i++) {
    if (commentLines[i].startsWith("@")) {
      const tokens = commentLines[i].split(" ");
      const tag = tokens[0].replace("@", "");

      let value = tokens.slice(1).join("");

      for (let j = i + 1; j < commentLines.length; j++) {
        if (commentLines[j].startsWith("@") || !commentLines[j]) {
          break;
        }

        value += "\n" + commentLines[i];
      }

      if (TAG_PARSERS[tag]) {
        tags.push(TAG_PARSERS[tag](value));
      } else {
        tags.push(TAG_PARSERS["tag"](tag, value));
      }
    }
  }

  const options: any = {tags};

  for (let i = 0; i < tags.length; i++) {
    if (TAG_MAP[tags[i].name]) {
      return TAG_MAP[tags[i].name](node, options);
    }
  }
  if (!node) {
    return null;
  }

  if (isClassDeclaration(node) || isClassExpression(node)) {
    return createDoc(partialDoc.name, "ClassDoc", options);
  }
  if (isClassMethod(node)) {
    return createDoc(node.key.name, "MethodDoc", options);
  }
  if (isClassProperty(node)) {
    return createDoc(node.key.name, "PropertyDoc", options);
  }
  if (isExpressionStatement(node) &&
      isMemberExpression(node.expression.left)) {
    options.scope = isThisExpression(node.expression.left.object) ?
      "this" : node.expression.left.object.name;

    return createDoc(node.expression.left.property.name, "PropertyDoc", options);
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
    partialDoc.node= null;
    partialDoc.parent = null;
    console.log(partialDoc);
    console.log("^ failed");
    return;
  }

  const parent = partialDoc.parent ? partialDoc.parent.doc : null;

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
