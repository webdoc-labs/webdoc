// @flow
import type {Node} from "@babel/types";
import type {TypedefDoc} from "@webdoc/types";
import {nodeIdentifier} from "./nodeIdentifier";
import {createDoc} from "@webdoc/model";

// Parse @typedef docs (they must have a @typedef tag)
export function parseTypedefDoc(node: Node, options: any): TypedefDoc {
  let name = options.tags.find((tag) => tag.type === "TypedefTag").alias;

  if (!name) {
    name = nodeIdentifier(node);
  }

  options.type = "TypedefDoc";

  return createDoc(name, "TypedefDoc", options);
}
