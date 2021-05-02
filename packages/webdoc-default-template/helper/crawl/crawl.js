// @flow

const {crawlReference} = require("./crawl-reference-explorer");
const {crawlTutorials} = require("./crawl-tutorials");
const model = require("@webdoc/model");
const {linker} = require("../linker");

// This file crawls the document tree to:
// + feed the linker database with links to pages to be generated.
// + build a hierarchy of explorer-targets

/*::
import type {
  RootDoc,
  DocType,
} from "@webdoc/types";

import type {
  LinkTable,
} from "@webdoc/template-library";

import type {ExplorerTarget} from './crawl-reference-explorer';

export type CategorizedDocumentList = {
  [id: DocType]: ?(Doc[])
}

export type CrawlData = {
  index: { [id: string]: [] & { url: string } };
  reference: ?ExplorerTarget;
  tutorials: ?ExplorerTarget;
};

declare function crawl(tree: RootDoc, index: string): CrawlData;
*/


function crawl(tree /*: RootDoc */, index /*: string */)/*: CrawlData */ {
  buildLinks(tree);

  const crawlData /*: CrawlData */ = {
    index: buildIndex(tree),
    reference: crawlReference(tree, index),
    tutorials: crawlTutorials(tree),
  };

  if (crawlData.reference) {
    // Add ClassIndex into explorer after (overview), while preserving order
    // $FlowFixMe
    crawlData.reference.children = Object.assign(...[
      ...crawlData.reference.children["(overview)"] ? [{
        "(overview)": crawlData.reference.children["(overview)"],
      }] : [],
      ...crawlData.index.classes.length > 0 ? [{
        ClassIndex: {
          title: "Class Index",
          page: crawlData.index.classes.url,
        },
      }] : [], {
        ...crawlData.reference.children,
      },
    ]);
  }

  return crawlData;
}

module.exports = ({crawl}/*: {crawl: typeof crawl} */);

function buildLinks(tree /*: RootDoc */) /*: LinkTable */ {
  const linkTable = {};

  model.traverse(tree, (doc) => {
    if (doc.type === "RootDoc") {
      doc.packages.forEach((packageDoc) => {
        linkTable[packageDoc.path] = linker.getURI(packageDoc);
      });

      return;
    }

    linkTable[doc.path] = linker.getURI(doc);
  });

  return linkTable;
}

function buildIndex(
  tree /*: RootDoc */,
)/*: { [string]: $ReadOnlyArray<Doc> & { url: string } } */ {
  const classIndexUrl = linker.createURI("Class-Index", true);

  const index /*: {[string]: Array<any> & {url: string}} */ = {
    classes: Object.assign(([] /*: any */), {url: classIndexUrl}),
  };

  model.traverse(tree, (doc) => {
    switch (doc.type) {
    case "ClassDoc":
      index.classes.push(doc);
      break;
    }
  });

  return index;
}
