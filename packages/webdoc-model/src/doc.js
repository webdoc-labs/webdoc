// @flow

import type {BaseDoc, Doc, DocLink, ClassDoc, ObjectDoc, TypedefDoc} from "@webdoc/types";

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
    scope: type === "MethodDoc" ? "instance" : "inner",
    version: "public",
    type,
  }, options || {});

  // Soft error when @memberof is not used.
  if (name.includes(".")) {
    console.error(name + " is a local identifer and contains a separator. Use @memberof instead " +
      "because this deprecated (legacy behaviour from JSDoc).");

    const path = name.split(".");

    doc.name = path[path.length - 1];
    doc.parserOpts = doc.parserOpts || {};

    if (doc.parserOpts.memberof) {
      doc.parserOpts.memberof.push(...path.slice(0, -1));
    } else {
      doc.parserOpts = path.slice(0, -1);
    }
  }

  doc.children = doc.children || [];
  doc.members = doc.children;

  // Link any pre-existing members to their parent
  for (let i = 0; i < doc.members.length; i++) {
    doc.members[i].parent = doc;
  }

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

/**
 * Clones the doc without its children or parent.
 *
 * @template T
 * @param {T} doc
 * @return {T}
 */
export function cloneDoc<T: BaseDoc>(doc: T): T {
  return Object.assign({}, doc, {children: [], members: [], parent: undefined});
}

// ------------------------------------------------------------------------------------------------
// Functions to discover symbols with a specific relation to the given doc.
// ------------------------------------------------------------------------------------------------

// TODO: Modify findExtendedDocs & findImplementedDocs to do two passes so that parents
// are in order of depth difference.

/**
 * Finds all the symbols that are extended by {@code doc}.
 *
 * @param {Doc} doc
 * @param {Set<DocLink>}[extended] - the set to insert the extended symbols into
 * @return {Set<DocLink>} the symbols that are extended
 */
export function findExtendedDocs(doc: Doc, extended?: Set<DocLink>): Set<DocLink> {
  extended = extended ? extended : new Set<DocLink>();

  if (!doc.extends) {
    return extended;
  }

  for (let i = 0; i < doc.extends.length; i++) {
    const extendedSymbol = doc.extends[i];

    extended.add(extendedSymbol);

    if (typeof extendedSymbol !== "string" && extendedSymbol.extends) {
      findExtendedDocs(extendedSymbol, extended);
    }
  }

  return extended;
}

/**
 * Finds all the symbols that are implemented by {@code doc}.
 *
 * @param {Doc} doc
 * @param {Set<DocLink>}[implemented] - the set to insert the implemented symbols into
 * @return {Set<DocLink>} the symbols that are implemented by {@code doc}
 */
export function findImplementedDocs(
  doc: ClassDoc | ObjectDoc | TypedefDoc,
  implemented?: Set<DocLink>,
): Set<DocLink> {
  implemented = implemented ? implemented : new Set<DocLink>();

  if (!doc.implements) {
    return implemented;
  }

  for (let i = 0; i < doc.implements.length; i++) {
    const implementedSymbol = doc.implements[i];

    implemented.add(implementedSymbol);

    if (typeof implementedSymbol !== "string" && implementedSymbol.implements) {
      findImplementedDocs(implementedSymbol, implemented);
    }
  }

  return implemented;
}
