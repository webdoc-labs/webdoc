// @flow

import * as model from "@webdoc/model";
import {BASE_PROPS} from "./const";
import type {Doc} from "@webdoc/types";
import type {DocumentedInterface} from "./types";
import _ from "lodash";

function deserializeTree(serialized: any, parent: ?Doc): Doc {
  if (!parent && serialized.type !== "RootDoc") {
    throw new Error("Tree root must declare type RootDoc!");
  }

  const doc: $Shape<Doc> = _.pick(serialized, BASE_PROPS);

  doc.members = [];
  doc.children = doc.members;

  if (doc.type === "RootDoc") {
    doc.packages = [];
    doc.tutorials = [];
  }

  if (!parent) {
    doc.stack = [doc.name];
  }

  if (serialized.description) {
    doc.description = serialized.description;
  }
  if (serialized.members) {
    for (let i = 0; i < serialized.members.length; i++) {
      const child = deserializeTree(serialized.members[i], (doc: any));

      model.addChildDoc(child, doc);
    }
  }

  return (doc: any);
}

/**
 * Reads the serialized documented interface from a JSON string.
 *
 * @param {string} data
 * @return {RootDoc}
 */
export default function read(data: string): DocumentedInterface {
  const documentedInterface = (JSON.parse(data): any);

  if (!("version" in documentedInterface)) {
    return ({
      version: "0.0.0",
      metadata: {},
      root: (deserializeTree(documentedInterface.root, null): any),
      registry: {},
    }: DocumentedInterface);
  }

  return {
    version: documentedInterface.version,
    metadata: documentedInterface.metadata,
    root: (deserializeTree(documentedInterface.root, null): any),
    registry: {},
  };
}
