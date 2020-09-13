// @flow

const {crawlReference} = require("./crawl-reference-explorer");
const {traverse} = require("@webdoc/model");
const {SymbolLinks} = require("@webdoc/template-library");

// This file crawls the document tree to:
// + feed the SymbolLinks database with links to pages to be generated.
// + build a hierarchy of explorer-targets

/*::
import type {
  RootDoc,
  DocType
} from "@webdoc/model";

export type CategorizedDocumentList = {
  [id: DocType]: ?(Doc[])
}
*/


exports.crawl = function crawl(tree /*: RootDoc */) {
  buildLinks(tree);

  return {
    index: buildIndex(tree),
    reference: crawlReference(tree),
  };
};

function buildLinks(tree /*: RootDoc */) /*: void */ {
  traverse(tree, (doc) => {
    if (doc.type === "RootDoc") {
      doc.packages.forEach((packageDoc) => {
        const link = SymbolLinks.createLink(packageDoc);

        SymbolLinks.registerLink(packageDoc.metadata.name, link);
      });

      return;
    }

    const link = SymbolLinks.createLink(doc);

    SymbolLinks.registerLink(doc.path, link);
  });
}

function buildIndex(tree /*: RootDoc */) /*: [id: string]: [] & { url: string } */ {
  const classIndexUrl = SymbolLinks.getFileName("Class-Index");

  const index /*: [id: string]: [] & { url: string } */ = {
    classes: [],
  };

  index.classes.url = classIndexUrl;

  traverse(tree, (doc) => {
    switch (doc.type) {
    case "ClassDoc":
      index.classes.push(doc);
      break;
    }
  });

  return index;
}
