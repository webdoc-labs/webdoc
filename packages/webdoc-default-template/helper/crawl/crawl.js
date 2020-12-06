// @flow

const {crawlReference} = require("./crawl-reference-explorer");
const {traverse} = require("@webdoc/model");
const {linker} = require("../linker");

// This file crawls the document tree to:
// + feed the linker database with links to pages to be generated.
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


exports.crawl = function crawl(tree /*: RootDoc */, index /*: string */) {
  buildLinks(tree);

  return {
    index: buildIndex(tree),
    reference: crawlReference(tree, index),
  };
};

function buildLinks(tree /*: RootDoc */) /*: void */ {
  traverse(tree, (doc) => {
    if (doc.type === "RootDoc") {
      doc.packages.forEach((packageDoc) => {
        linker.getURI(packageDoc);
      });

      return;
    }

    linker.getURI(doc);
  });
}

function buildIndex(tree /*: RootDoc */) /*: [id: string]: [] & { url: string } */ {
  const classIndexUrl = linker.createURI("Class-Index", true);

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
