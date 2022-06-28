// @flow

import type {RootDoc} from "@webdoc/types";

export type SerializedDataType = {
  tokens: Array<{
    value: string,
    kind: "link" | "canonical",
  }>,
  template: string,
};

export type SerializedParam = {
  identifier: string,
  dataType?: ?SerializedDataType,
  description: string,
  optional?: string,
  default?: string,
  variadic?: boolean,
};

export type SerializedReturn = {
  description: string,
  dataType: SerializedDataType,
};

export type Manifest = {
  version: string;
  metadata: {
    siteRoot?: string;
    siteDomain?: string;
    linker?: "require('@webdoc/template-library').LinkerPlugin" | string;
    [string]: string;
  };
  root: RootDoc;
  registry: {
    [string]: {
      uri: string;
    };
  };
};
