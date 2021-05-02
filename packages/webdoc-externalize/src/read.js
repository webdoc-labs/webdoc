// @flow

import * as model from "@webdoc/model";
import {BASE_PROPS} from "./const";
import type {Doc} from "@webdoc/types";
import type {Manifest} from "./types";
import _ from "lodash";

function deserializeTree(serialized: any, parent: ?Doc): Doc {
  if (!parent && serialized.type !== "RootDoc") {
    throw new Error("Tree root must declare type RootDoc!");
  }

  const doc: any = _.pick(serialized, BASE_PROPS);

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
export default function read(data: string): Manifest {
  const manifest = (JSON.parse(data): any);

  if (!("version" in manifest)) {
    return ({
      version: "0.0.0",
      metadata: {},
      root: (deserializeTree(manifest.root, null): any),
      registry: {},
    }: Manifest);
  }

  return {
    version: manifest.version,
    metadata: manifest.metadata,
    root: (deserializeTree(manifest.root, null): any),
    registry: manifest.registry,
  };
}
