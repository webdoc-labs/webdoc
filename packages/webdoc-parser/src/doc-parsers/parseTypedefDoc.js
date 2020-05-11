// @flow
import type {Node} from "@babel/types";
import type {TypedefDoc} from "@webdoc/types";
import {nodeIdentifer} from "./nodeIdentifer";
import {createDoc} from "@webdoc/model";

// Parse @typedef docs (they must have a @typedef tag)
export function parseTypedefDoc(node: Node, options: any): TypedefDoc {
  let name = options.tags.find((tag) => tag.type === "TypedefTag").alias;

  if (!name) {
    name = nodeIdentifer(node);
  }

  options.type = "TypedefDoc";

  return createDoc(name, "TypedefDoc", options);
}
