// @flow

import type {ExtendsTag, ImplementsTag, MixesTag} from "@webdoc/types";

// Parses "@extends ExtendedClass" tags
export function parseExtends(value: string, options: $Shape<Doc>): ExtendsTag {
  if (!options.extends) {
    options.extends = [value];
  } else {
    options.extends.push(value);
  }

  return {
    value,
    type: "ExtendsTag",
  };
}

// Parses "@implements ImplementedInterface" tags
export function parseImplements(value: string, options: $Shape<Doc>): ImplementsTag {
  if (!options.implements) {
    options.implements = [value];
  } else {
    options.implements.push(value);
  }

  return {
    value,
    type: "ImplementsTag",
  };
}

// Parses "@mixes MixedMixin" tagss
export function parseMixes(value: string, options: $Shape<Doc>): MixesTag {
  if (!options.mixes) {
    options.mixes = [value];
  } else {
    options.mixes.push(value);
  }

  return {
    value,
    type: "MixesTag",
  };
}
