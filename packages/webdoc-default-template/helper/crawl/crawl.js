// @flow

const {crawlReference} = require("./crawl-reference-explorer");

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
  return {
    reference: crawlReference(tree),
  };
};
