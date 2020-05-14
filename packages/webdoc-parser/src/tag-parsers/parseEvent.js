// @flow

import type {EventTag} from "@webdoc/types";

export function parseEvent(value: string, options: { [id: string]: any }): EventTag {
  return {
    name: options.name || "event",
    event: value,
    value,
    type: "EventTag",
  };
}
