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
import type {Manifest} from "@webdoc/externalize";
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

function crawl(
  manifest /*: Manifest */,
  index /*: string */,
)/*: CrawlData */ {
  const tree = manifest.root;

  buildLinks(manifest);

  const crawlData /*: CrawlData */ = {
    index: buildIndex(tree),
    reference: crawlReference(tree, index),
    tutorials: crawlTutorials(tree),
  };

  if (crawlData.reference) {
    // Add ClassIndex into explorer after (overview), while preserving order
    // $FlowFixMe[unsupported-syntax]
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

function buildLinks(manifest /*: Manifest */) /*: void */ {
  const registry = manifest.registry;

  model.traverse(manifest.root, (doc) => {
    if (doc.type === "RootDoc") {
      doc.packages.forEach((packageDoc) => {
        if (!registry[packageDoc.id]) {
          registry[packageDoc.id] = {};
        }

        registry[packageDoc.id].uri = linker.getURI(packageDoc);
      });

      return;
    }

    if (!registry[doc.id]) {
      registry[doc.id] = {};
    }

    registry[doc.id].uri = linker.getURI(doc);
  });
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
