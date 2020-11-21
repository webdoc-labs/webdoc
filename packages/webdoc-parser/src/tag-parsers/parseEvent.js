// @flow

import type {EventTag} from "@webdoc/types";

// @event {<DATA_TYPE>} <NAME>

export function parseEvent(value: string, options: { [id: string]: any }): $Shape<EventTag> {
  return {
    event: value,
    value,
    type: "EventTag",
  };
}
