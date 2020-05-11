// @flow

import type {BaseDoc, Doc} from "@webdoc/types";

function updateScope(doc: Doc, scopeStack: string[], scopePath: string): void {
  if (scopePath) {
    doc.stack = [...scopeStack, doc.name];
    doc.path = `${scopePath}.${doc.name}`;
  } else {
    doc.stack = [doc.name];
    doc.path = `${doc.name}`;
  }

  for (let i = 0; i < doc.children.length; i++) {
    updateScope(doc.children[i], doc.stack, doc.path);
  }
}

// eslint-disable-next-line
/**
 * Creates a valid doc object with a name & type.
 *
 * @param {string}[name]
 * @param {string}[type="BaseDoc"]
 * @param {*}[options]
 * @return {BaseDoc}
 */
export const createDoc = (name?: string, type?: string = "BaseDoc", options: any) => {
  const doc = Object.assign({
    name,
    path: "",
    stack: [""],
    parent: null,
    children: [],
    tags: [],
    brief: "",
    description: "",
    access: "public",
    scope: type === "MethodDoc" ? "instance" : "static",
    version: "public",
    type,
  }, options || {});

  doc.children = doc.children || [];
  doc.members = doc.children;

  return doc;
};

/**
 * Searches for the doc named {@code lname} in the given scoped documentation.
 *
 * @param {string} lname
 * @param {BaseDoc} scope
 * @return {Doc} - the child doc
 */
export function childDoc(lname: string, scope: BaseDoc): ?Doc {
  const {children} = scope;

  for (let i = 0; i < scope.children.length; i++) {
    const child = children[i];

    if (child.name === lname) {
      return child;
    }
  }
}

/**
 * @template T
 * @param {T} doc
 * @param {BaseDoc} scope
 * @return {T}
 */
export function addChildDoc<T: BaseDoc>(doc: T, scope: BaseDoc): T {
  if (doc.parent) {
    const i = doc.parent.children.indexOf(doc);

    if (i >= 0) {
      doc.parent.children.splice(i, 1);
    }
  }

  const {children} = scope;
  let index = -1;

  for (let i = 0; i < scope.children.length; i++) {
    const child = children[i];

    if (child.name === doc.name) {
      children[i] = doc;
      index = i;
      break;
    }
  }

  if (index === -1) {
    children.push(doc);
  }

  doc.parent = scope;
  updateScope(doc, scope.stack, scope.path);

  return doc;
}

export function removeChildDoc(doc: BaseDoc, noUpdate: boolean = false) {
  if (doc.parent) {
    const i = doc.parent.children.indexOf(doc);

    if (i >= 0) {
      doc.parent.children.splice(i, 1);

      if (!noUpdate) {
        updateScope(doc, [], "");
      }
    }
  }
}

/**
 * Finds the doc whose relative path is {@code path} w.r.t {@code root}.
 *
 * @param {string | string[]} path
 * @param {BaseDoc} root
 * @return {?Doc}
 */
export function doc(path: string | string[], root: BaseDoc): ?Doc {
  const docStack = Array.isArray(path) ? path : path.split(/[.|#]/);
  let doc = root;

  if (docStack.length === 1 && docStack[0] === "") {
    return doc;
  }

  for (let i = 0; i < docStack.length; i++) {
    const child = childDoc(docStack[i], doc);

    if (!child) {
      return null;
    }

    doc = child;
  }

  return doc;
}

/**
 * Adds a doc at its path in the doc-tree.
 *
 * @template T
 * @param {T} doc
 * @param {BaseDoc} root
 * @return {?T} - the doc, if it was added
 */
export function addDoc<T: BaseDoc>(doc: T, root: BaseDoc): ?T {
  const docStack = doc.stack ? doc.stack : doc.path.split(/[.|#]/);
  let scope = root;

  for (let i = 0; i < docStack.length - 1; i++) {
    const child = childDoc(docStack[i], scope);

    if (!child) {
      return null;
    }

    scope = doc;
  }

  addChildDoc(doc, scope);
  return doc;
}
