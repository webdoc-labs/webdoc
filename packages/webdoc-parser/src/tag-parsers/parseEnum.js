// @flow
import type {Doc, EnumTag} from "@webdoc/types";
import {StringUtils, matchDataTypeClosure} from "./helper";
import {parseDataType} from "@webdoc/model";

// @enum [{<DATA_TYPE>}] [<NAME>]

export function parseEnum(value: string, doc: $Shape<Doc>): EnumTag {
  const dataTypeClosure = matchDataTypeClosure(value);

  if (dataTypeClosure) {
    value = StringUtils.del(value, dataTypeClosure).trimStart();

    const dataType = dataTypeClosure[0].slice(1, -1);

    doc.dataType = parseDataType(dataType);
  }

  if (value) {
    doc.name = value.trim();
  }

  return {
    value,
    type: "EnumDoc",
  };
}
