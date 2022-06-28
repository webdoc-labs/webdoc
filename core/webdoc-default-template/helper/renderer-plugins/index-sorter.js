/*::
import type {Doc} from "@webdoc/types";

type SortedIndex = Array<{ prefix: string, list: Doc[] }>
*/

// This plugin sorts a list of documents into buckets of "prefixes". Each document
// is put into the bucket with the prefix its name starts with.
//
// Currently, prefixes are:
// + an alphabet: each letter of the alphabet (A, B, C, ..., Z)
// + blank: for document names starting without an alphabet

exports.indexSorterPlugin = (list /*: Doc[] */) => /*: SortedIndex */ {
  const indexMap = {};

  // Sort list by document name
  list.sort((d1, d2) => d1.name.localeCompare(d2.name));

  // Populate index-map with lazily-initalized buckets, ensuring zero-length buckets
  // are eliminated.
  list.forEach((doc) => {
    const prefix = doc.name.charAt(0);
    let bucket;

    // charCode of "A" = 65, "Z" = 90
    // charCode of "a" = 97, "z" = 122

    if (prefix >= "A" && prefix <= "Z") {
      bucket = prefix;
    } else if (prefix >= "a" && prefix <= "z") {
      bucket = String.fromCharCode(65 + (prefix.charCodeAt(0) - 97));
    } else {
      bucket = "";
    }

    if (!indexMap[bucket]) {
      indexMap[bucket] = [];
    }

    indexMap[bucket].push(doc);
  });

  return Object.keys(indexMap)
    .sort((key1, key2) => key1.localeCompare(key2))
    .map((key) => ({prefix: key, list: indexMap[key]}));
};
