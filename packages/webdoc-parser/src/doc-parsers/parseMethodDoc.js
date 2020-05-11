// @flow
import type {Node} from "@babel/types";
import type {MethodDoc} from "@webdoc/types";
import {nodeIdentifer} from "./nodeIdentifer";
import {createDoc} from "@webdoc/model";

// TODO (future): infer param types, return type from flow/typescript ast

// Parse method docs (node is either a method or @method)
export function parseMethodDoc(node: Node, options: any): MethodDoc {
  const name = options.name || nodeIdentifer(node);
  return createDoc(name, "MethodDoc", options);
}
