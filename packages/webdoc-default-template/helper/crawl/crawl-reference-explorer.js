// @flow

const {SymbolLinks} = require("@webdoc/template-library");
const {traverse} = require("@webdoc/model");

/*::
import type {
  Doc,
  DocType,
  PackageDoc,
  RootDoc
} from "@webdoc/types";
import type {CategorizedDocumentList} from "./crawl";
*/

const DOC_TYPE_TO_TITLE = {
  "PackageDoc": "Packages",
  "ModuleDoc": "Modules",
  "NSDoc": "Namespaces",
  "ClassDoc": "Classes",
  "EnumDoc": "Enums",
  "InterfaceDoc": "Interfaces",
  "FunctionDoc": "Functions",
  "TypedefDoc": "Type Definitions",
};

const HIERARCHY_SPECIFIERS = {
  "RootDoc": ["PackageDoc", "ModuleDoc",
    "ClassDoc", "EnumDoc", "InterfaceDoc", "FunctionDoc", "NSDoc", "TypedefDoc"],
  "PackageDoc": ["ClassDoc", "EnumDoc", "InterfaceDoc", "FunctionDoc", "NSDoc", "TypedefDoc"],
  "ModuleDoc": ["ClassDoc", "EnumDoc", "InterfaceDoc", "FunctionDoc", "NSDoc", "TypedefDoc"],
  "NSDoc": ["ClassDoc", "EnumDoc", "InterfaceDoc", "FunctionDoc", "TypedefDoc"],
};

const HINTS = {
  "EnumDoc": "(enum)",
  "FunctionDoc": "(function)",
  "InterfaceDoc": "(interface)",
  "MixinDoc": "(mixin)",
  "NSDoc": "(namespace)",
};

// Crawls the tree searching for the API reference
function crawlReference(doc /*: Doc */) {
  const explorerHierarchy = buildExplorerHierarchy(doc, doc.packages ? (doc.packages.length > 1) : false);

  const tree = buildExplorerTargetsTree(explorerHierarchy);

  return tree;
}

exports.crawlReference = crawlReference;

/*::
type ExplorerNode = {
  doc: Doc,
  children: CategorizedDocumentList,
*/

function buildExplorerHierarchy(rootDoc /*: RootDoc */, multiPackage = false) /*: ExplorerNode */ {
  const hierarchyStack /*: DocType[][] */ = [];
  const rootNode = {doc: rootDoc, children: {}};

  let baseNode = rootNode;

  const traversalContext = {
    enter(doc) {
      if (doc.type === "RootDoc" || doc.type === "PackageDoc") {
        hierarchyStack.push([baseNode]);
        return;
      }

      // Find which ancestor ExplorerNode which will accept this Doc
      const hierarchy = hierarchyStack[hierarchyStack.length - 1];
      let parent;

      for (let i = hierarchy.length - 1; i >= 0; i--) {
        const acceptedDocs = HIERARCHY_SPECIFIERS[hierarchy[i].doc.type];

        if (!acceptedDocs) {
          continue;
        }
        if (acceptedDocs.includes(doc.type)) {
          parent = i;
          break;
        }
      }

      if (typeof parent === "number") {
        const node = {doc, children: {}};

        // ExplorerNode is added to the hiearchy below the parent at index i
        hierarchyStack.push([...hierarchy.slice(0, parent + 1), node]);

        // Add as child to parentNode
        const parentNode = hierarchy[parent];

        if (!parentNode.children[doc.type]) {
          parentNode.children[doc.type] = [];
        }

        parentNode.children[doc.type].push(node);
      } else {
        // ExplorerNode ancestors are same and this doc is not included (pass-through)
        hierarchyStack.push([...hierarchy]);
      }
    },
    exit(doc) {
      hierarchyStack.pop();
    },
  };

  if (!multiPackage) {
    traverse(rootDoc, traversalContext);
  } else {
    rootNode.children.PackageDoc = [];

    rootDoc.packages.forEach((pkgDoc) => {
      const pkgNode = {
        doc: pkgDoc,
        children: {},
      };

      rootNode.children.PackageDoc.push(pkgNode);

      baseNode = pkgNode;

      traversePackage(pkgDoc, traversalContext);
    });
  }

  return rootNode;
}

/*::
type PackageTraversalContext = {
  [id: "enter" | "exit"]: (doc: Doc) => void,
};
*/

function traversePackage(doc /*: Doc | PackageDoc */, context /*: Object */, parentWasPackage) {
  if (doc.type !== "PackageDoc" &&
    !parentWasPackage &&
    doc.parent.type !== "RootDoc" &&
    (doc.type === "ClassDoc" || doc.type === "ObjectDoc" || doc.type === "NSDoc" || doc.parent.type === "NSDoc") &&
    doc.loc.file.package !== doc.parent.loc.file.package) {
    // cannot enter into a different package's API
    return;
  }

  context.enter(doc);

  const arr = doc.members || doc.api;

  for (let i = 0; i < arr.length; i++) {
    traversePackage(arr[i], context, doc.type === "PackageDoc");
  }

  context.exit(doc);
}

function buildExplorerTargetsTree(node /*: ExplorerNode */, parentTitle /*: string */ = "") /*: ExplorerTarget */ {
  const doc = node.doc;
  const page = SymbolLinks.pathToUrl.get(doc.path);

  let title = "";

  if (doc.type !== "PackageDoc") {
    const sliceIndex = (parentTitle ? doc.path.indexOf(parentTitle) + parentTitle.length : -1) + 1;

    title = doc.path.slice(sliceIndex);

    node.title = `${title}${HINTS[doc.type] ? " " + HINTS[doc.type] : ""}`;
  } else {
    node.title = doc.metadata.name;
    // Don't pass on title for packages
  }

  const childNodes = node.children;
  const childrenCategories = Object.keys(node.children);

  if (HIERARCHY_SPECIFIERS[doc.type]) {
    node.children = {};

    node.children["(overview)"] = {
      title: "(overview)",
      page,
    };

    if (node.doc.type === "RootDoc") {
      node.children["(overview)"].page = "index.html";

      node.children.ClassIndex = {
        title: "Class Index",
        page: SymbolLinks.getFileName("Class-Index"),
      };
    }

    for (const [key, value] of Object.entries(childNodes)) {
      const children = value.map((cn) => buildExplorerTargetsTree(cn, title));

      children.forEach((child) => {
        node.children[child.title] = child;
      });
    }

    node.page = null;
  } else {
    node.page = page;
  }

  delete node.doc;
  return node;
}
