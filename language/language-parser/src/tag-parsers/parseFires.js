import type {FiresTag} from "@webdoc/types";

// @fires <EVENT_NAME>

// Parses the (@fires event) tag.
export function parseFires(value: string, options: { [id: string]: any }): FiresTag {
  options.fires = options.fires || [];
  options.fires.push(value);

  return {
    name: "fires",
    event: value,
    value,
    type: "FiresTag",
  };
}
