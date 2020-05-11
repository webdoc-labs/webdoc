// @flow
import type {Node} from "@babel/types";
import type {EventDoc} from "@webdoc/types";
import {nodeIdentifer} from "./nodeIdentifer";
import {createDoc} from "@webdoc/model";
import {CANONICAL_DELIMITER} from "../constants";

// Parses @event docs. These aren't really interesting.
export function parseEventDoc(node: ?Node, options: { [id: string]: any }): EventDoc {
  const eventTag = options.tags.find((tag) => tag.type === "EventTag");
  let name = eventTag ? eventTag.event : options.name;

  if (!name && node) {
    name = nodeIdentifer(node);
  }
  if (!name) {
    name = "UnknownEvent";
  }

  const cpath = name.split(CANONICAL_DELIMITER);
  const simpleName = cpath[cpath.length - 1];
  --cpath.length;
  const parent = cpath.length ? cpath.join("").slice(0, -1) : "";

  options.parserOpts = options.parserOpts || {};
  options.parserOpts.memberof = parent;

  return createDoc(simpleName, "EventDoc", options);
}
