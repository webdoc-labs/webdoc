// @flow

import {
  BASE_PROPS,
  LINK_PROPS,
  PARAM_PROPS,
} from "./const";
import type {
  DataType,
  Doc,
  DocLink,
  Param,
  Return,
  RootDoc,
} from "@webdoc/types";
import type {
  DocumentedInterface,
  SerializedDataType,
  SerializedParam,
  SerializedReturn,
} from "./types";
import _ from "lodash";

const LATEST_VERSION = "1.0.0";

const TRUNCATE_128 = {
  length: 128,
  omission: "...",
};

function serializeDataType(dataType: DataType): SerializedDataType {
  const tokensSerialized = new Array(dataType.length);

  for (let i = 0; i < dataType.length; i++) {
    const token = dataType[i];

    tokensSerialized[i] = typeof token === "string" ? {
      value: token,
      kind: "canonical",
    } : {
      value: token.path,
      kind: "link",
    };
  }

  return {
    tokens: tokensSerialized,
    template: dataType.template,
  };
}

function serializeParams(params: Param[]): SerializedParam[] {
  return params.map<SerializedParam>((param: Param) => {
    const serializedParam: $Shape<SerializedParam> = _.pick(param, PARAM_PROPS);

    if (param.description) {
      serializedParam.description = _.truncate(param.description, TRUNCATE_128);
    }
    if (param.dataType) {
      serializedParam.dataType = serializeDataType(param.dataType);
    }

    return serializedParam;
  });
}

function serializeReturns(returns: Return[]): SerializedReturn[] {
  return returns.map<SerializedReturn>((returnItem: Return) => {
    const serializedReturn: $Shape<SerializedReturn> = {};

    if (returnItem.description) {
      serializedReturn.description = _.truncate(returnItem.description, TRUNCATE_128);
    }
    if (returnItem.dataType) {
      serializedReturn.dataType = serializeDataType(returnItem.dataType);
    }

    return serializedReturn;
  });
}

function serializeDocumentLinks(links: $ReadOnlyArray<DocLink | string>): Array<string> {
  return links.map((link) => typeof link === "string" ? link : link.path);
}

// Serialize the document tree into a format that can be safely written as JSON.
//
// The serialized format does not contain cross references between different documents,
// e.g. the "extends" array is converted into document paths for classes, "params" data-type
// tokens are categorized as links/canonical and stored with only string values.
function serializeTree(doc: Doc): any {
  const serialized = _.pick(doc, BASE_PROPS);

  if (doc.description) {
    serialized.description = _.truncate(doc.description, TRUNCATE_128);
  }
  if ("params" in doc) {
    serialized.params = serializeParams(((doc: any).params: Param[]));
  }
  if ("returns" in doc) {
    serialized.returns = serializeReturns(((doc: any).returns: Return[]));
  }
  for (const linkProp of LINK_PROPS) {
    if (linkProp in doc) {
      serialized[linkProp] = serializeDocumentLinks(((doc: any): $ReadOnlyArray<DocLink>));
    }
  }
  if (doc.members.length) {
    serialized.members = new Array(doc.members.length);

    for (let i = 0; i < doc.members.length; i++) {
      (serialized.members: any)[i] = serializeTree(doc.members[i]);
    }
  }

  return serialized;
}

/**
 * Create an documented interface the document tree, with no metadata.
 *
 * @param {RootDoc} documentTree
 * @return {DocumentedInterface}
 */
export function fromTree(documentTree: RootDoc): DocumentedInterface {
  return {
    version: LATEST_VERSION,
    metadata: {},
    root: documentTree,
    registry: {},
  };
}

/**
 * Serialize the documented interface into a JSON string.
 *
 * @param {DocumentedInterface} documentedInterface
 * @return {string} - Serialized JSON string
 * @see serializeTree
 */
export default function write(documentedInterface: DocumentedInterface): string {
  return JSON.stringify(
    {
      version: documentedInterface.version,
      metadata: documentedInterface.metadata,
      root: serializeTree(documentedInterface.root),
      registry: documentedInterface.registry,
    },
    null,
    "\t",
  );
}
