// @flow

import type {BaseDoc, Doc, DocLink, DocType, PackageDoc, RootDoc, TutorialDoc} from "@webdoc/types";
import {nanoid} from "nanoid";

export const CANONICAL_SEPARATOR = /([.#~$])/g;

function updateScope(doc: Doc, scopeStack: string[], scopePath: string): void {
  if (scopePath) {
    if (scopeStack) {
      doc.stack = [...scopeStack, doc.name];
    }
    doc.path = `${scopePath}.${doc.name}`;
  } else {
    doc.stack = [doc.name];
    doc.path = `${doc.name}`;
  }

  for (let i = 0; i < doc.members.length; i++) {
    updateScope(doc.members[i], doc.stack, doc.path);
  }
}

// eslint-disable-next-line
/**
 * Creates a valid doc object with a name & type.
 *
 * @param {string}[name]
 * @param {string}[type="BaseDoc"]
 * @param {*}[options]
 * @param {*}[instance] - the doc object to assign properties (if not provided, a new object
 *    is created)
 * @return {BaseDoc}
 */
export const createDoc = (
  name?: string,
  type: DocType,
  options: any,
  instance: any,
): BaseDoc => {
  const doc: Doc = (Object.assign(instance || {}, {
    id: nanoid(),
    name,
    path: "",
    stack: [""],
    parent: null,
    members: [],
    tags: [],
    brief: "",
    description: "",
    access: "public",
    scope: type === "MethodDoc" ? "instance" : "inner",
    type,
  }, options || {}) : any);

  const separators = doc.name.match(CANONICAL_SEPARATOR);

  // @memberof is not used, rather the user directly used the longname
  if (separators) {
    const lastSeparator = separators[separators.length - 1];

    if (lastSeparator === "#") {
      doc.scope = "instance";
    } else if (lastSeparator === "~") {
      doc.scope = "inner";
    } else {
      doc.scope = "static";
    }

    // Sad: splitting will include the separators so filter them
    const path = doc.name.split(CANONICAL_SEPARATOR)
      .filter((ch) => ch !== "." && ch !== "#" && ch !== "~");
    const parserOpts = doc.parserOpts || {};

    doc.name = path[path.length - 1];
    doc.parserOpts = parserOpts;

    if (parserOpts.memberof) {
      parserOpts.memberof.push(...path.slice(0, -1));
    } else {
      parserOpts.memberof = path.slice(0, -1);
    }
  }

  doc.members = doc.members || [];
  doc.children = doc.members;

  // Link any pre-existing members to their parent
  for (let i = 0; i < doc.members.length; i++) {
    doc.members[i].parent = doc;
  }

  return doc;
};

export function createRootDoc(): RootDoc {
  return {
    id: `root-${nanoid()}`,
    members: [],
    name: "",
    packages: [],
    path: "",
    stack: [],
    tags: [],
    tutorials: [],
    type: "RootDoc",
  };
}

export function createPackageDoc(
  name: string = "<webdoc.internal>",
  location?: string,
  metadata?: any,
): PackageDoc {
  return {
    api: [],
    id: `pkg-${nanoid()}`,
    members: [],
    metadata: metadata || {},
    name,
    path: name,
    stack: [name],
    location: location || "nowhere",
    type: "PackageDoc",
  };
}

/**
 * Creates a {@link TutorialDoc}.
 *
 * @param {string} title - The title of the tutorial.
 * @param {string} route - The relative path to the tutorial's file.
 * @param {string} content - The text-encoded content of the tutorial.
 * @param {$Shape<TutorialDoc>} data - Additional data about the tutorial.
 * @return {TutorialDoc}
 */
export function createTutorialDoc(
  title: string,
  route: string,
  content: string,
  data?: $Shape<TutorialDoc>,
): TutorialDoc {
  return {
    id: `tutorial-${title}`,
    title,
    route,
    content,
    name: title,
    path: title,
    stack: [title],
    members: [],
    type: "TutorialDoc",
    ...data,
  };
}

/**
 * Searches for the doc named {@code lname} in the given scoped documentation.
 *
 * @param {string} lname
 * @param {BaseDoc} scope
 * @return {Doc} - the child doc
 */
export function childDoc(lname: string, scope: BaseDoc): ?Doc {
  const {members} = scope;

  for (let i = 0; i < members.length; i++) {
    const child = members[i];

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
export function addChildDoc<T: Doc>(doc: T, scope: Doc): T {
  if (typeof doc.parent !== "undefined" && doc.parent !== null) {
    const parent = doc.parent;
    const i = parent.members.indexOf(doc);

    if (i >= 0) {
      parent.members.splice(i, 1);
    }
  }

  const {members} = scope;
  const index = -1;

  if (index === -1) {
    members.push(doc);
  }

  doc.parent = scope;
  updateScope(doc, scope.stack, scope.path);

  return doc;
}

export function removeChildDoc(doc: Doc, noUpdate: boolean = false) {
  if (!doc.parent) {
    return;
  }

  const parent = doc.parent;
  const i = parent.members.indexOf(doc);

  if (i >= 0) {
    parent.members.splice(i, 1);

    if (!noUpdate) {
      updateScope(doc, [], "");
    }
  }
}

/**
 * Finds the doc whose relative path is {@code path} w.r.t {@code root}.
 *
 * @param {string | string[]} path
 * @param {Doc} root
 * @return {?Doc}
 */
export function doc(path: string | string[], root: Doc): ?Doc {
  // Packages
  if (root.type === "RootDoc") {
    const packages: PackageDoc[] = (root: RootDoc).packages;
    const tutorials: TutorialDoc[] = (root: RootDoc).tutorials;

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];

      if (pkg.name === path) {
        return pkg;
      }
    }

    for (let i = 0; i < tutorials.length; i++) {
      const tutorial = tutorials[i];

      if (tutorial.name === path) {
        return tutorial;
      }
    }
  }

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

// Sometimes findDoc is a better name
export const findDoc = doc;

// Find the accessed-symbol's documentation at the symbol backing "refereeDoc"
export function findAccessedDoc(
  referredName: string | string[],
  refereeDoc: Doc,
): ?Doc {
  if (typeof referredName === "string") {
    referredName = referredName.split(CANONICAL_SEPARATOR);
  }

  const searchName = referredName[0];

  if (refereeDoc.parent) {
    const parent = refereeDoc.parent;
    const siblings = parent.members;

    for (let i = 0, j = siblings.length; i < j; i++) {
      if (siblings[i].name === searchName) {
        if (referredName.length > 1) {
          return findDoc(referredName.slice(1), parent.members[i]);
        } else {
          return siblings[i];
        }
      }
    }

    return findAccessedDoc(referredName, parent);
  }

  return null;
}

/**
 * Adds a doc at its path in the doc-tree.
 *
 * @template T
 * @param {T} doc
 * @param {Doc} root
 * @return {?T} - the doc, if it was added
 */
export function addDoc<T: Doc>(doc: T, root: Doc): ?T {
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
export function cloneDoc<T: Doc>(doc: T): T {
  // $FlowFixMe
  return Object.assign({}, doc, {
    id: nanoid(),
    children: [],
    members: [],
    parent: undefined,
  });
}

/**
 * Mangle the document name. If two documents have the same mangled name, then they shouldn't be
 * siblings (indicating a duplication).
 *
 * @param {Doc} doc
 * @return {string} - The mangled string name.
 */
export function mangled(doc: Doc): string {
  if (doc.type === "MethodDoc") {
    return `${doc.type}:${doc.name}:${
      doc.params.map((p) => p.dataType ? p.dataType[0] : "unknown").join("-")}`;
  }

  return `${doc.type}:${doc.name}`;
}

/**
 * You can pass this to traverse too.
 */
export type TraversalContext = {
  [id: DocType | "enter" | "exit"]: ((doc: Doc) => TraversalOptions | void)
}

export type TraversalOptions = {
  skipSubtree?: boolean
}

/**
 * Preorder traversal of all the docs
 *
 * @param {Doc} doc
 * @param {Function | TraversalContext} callback
 */
export function traverse(doc: Doc, callback: ((doc: Doc) => void) | TraversalContext) {
  if (typeof callback === "object") {
    traverseWithContext(doc, callback);
    return;
  }

  callback(doc);

  for (let i = 0; i < doc.members.length; i++) {
    traverse(doc.members[i], callback);
  }
}

// Traversal with context
export function traverseWithContext(doc: Doc, context: TraversalContext) {
  let traversalOptions;

  if (context.enter) {
    traversalOptions = context.enter(doc);
  }

  if (context[doc.type]) {
    traversalOptions = traversalOptions ?
      {...context[doc.type](doc), ...traversalOptions} :
      context[doc.type](doc);
  }

  if (!traversalOptions || !traversalOptions.skipSubtree) {
    for (let i = 0, j = doc.members.length; i < j; i++) {
      traverseWithContext(doc.members[i], context);
    }
  }

  if (context.exit) {
    context.exit(doc);
  }
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
export function searchExtendedClasses(doc: Doc, extended?: Set<DocLink>): Set<DocLink> {
  extended = extended ? extended : new Set<DocLink>();

  if (!doc.extends) {
    return extended;
  }

  for (let i = 0; i < doc.extends.length; i++) {
    const extendedSymbol = doc.extends[i];

    extended.add(extendedSymbol);

    if (typeof extendedSymbol !== "string" && extendedSymbol.extends) {
      searchExtendedClasses(extendedSymbol, extended);
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
export function searchImplementedInterfaces(
  doc: Doc,
  implemented?: Set<DocLink>,
): Set<DocLink> {
  implemented = implemented ? implemented : new Set<DocLink>();

  if ("implements" in doc) {
    // eslint-disable-next-line no-undef
    const implementsArr = ((doc: any).implements: $ReadOnlyArray<DocLink>);

    if (!implementsArr) {
      return implemented;
    }

    for (let i = 0; i < implementsArr.length; i++) {
      const implementedSymbol = implementsArr[i];

      implemented.add(implementedSymbol);

      if (typeof implementedSymbol !== "string" && implementedSymbol.implements) {
        searchImplementedInterfaces(implementedSymbol, implemented);
      }
    }
  }

  return implemented;
}
