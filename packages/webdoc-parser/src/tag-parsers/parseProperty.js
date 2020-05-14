// @flow
import type {Doc, PropertyTag} from "@webdoc/types";
import {parseParam} from "./parseParam";
import {createDoc} from "@webdoc/model";

export function parseProperty(value: string, doc: $Shape<Doc>): PropertyTag {
  // Nice little hack, need to separate out this one!
  let o;
  const {identifer, referred, description} = o = parseParam(value, {});
  const dataType = [referred, referred];

  if (!doc.children) {
    doc.children = [];
  }

  doc.children.push(createDoc(identifer, "PropertyDoc", {
    object: null,
    dataType,
    description,
    scope: "default", // related-resolution doctree-mod will resolve this
  }));

  return {
    name: "property",
    dataType,
    description,
    type: "PropertyTag",
  };
}
