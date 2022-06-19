// @flow

import type {
  BaseDoc,
  ExtendsTag,
  ImplementsTag,
  MixesTag,
} from "@webdoc/types";

// @extends     <SUPER_CLASS>
// @implements  <INTERFACE>
// @mixes       <MIXIN>

// Parses "@extends ExtendedClass" tags
export function parseExtends(value: string, options: $Shape<BaseDoc>): $Shape<ExtendsTag> {
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
export function parseImplements(value: string, options: any): $Shape<ImplementsTag> {
  if (!options.implements) {
    options.implements = [value];
  } else {
    options.implements.push(value);
  }

  return {
    name: "implements",
    value,
    type: "ImplementsTag",
  };
}

// Parses "@mixes MixedMixin" tagss
export function parseMixes(value: string, options: any): $Shape<MixesTag> {
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
