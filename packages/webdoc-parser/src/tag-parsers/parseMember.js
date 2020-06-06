import {parserLogger, tag} from "../Logger";
import type {MemberTag} from "@webdoc/types";
import {StringUtils} from "./helper";
import {parseDataType} from "@webdoc/model";

// @member {<DATA_TYPE>}

// Parses @member {DataType} tags (no description)
export function parseMember(value: string, options: any): MemberTag {
  // Extract {DataType}
  const dataTypeClosureResult = /{([^{}])+}/.exec(value);
  const dataTypeClosure = dataTypeClosureResult ? dataTypeClosureResult[0] : "";
  const dataType = dataTypeClosure.slice(1, -1);

  if (dataTypeClosure && dataTypeClosure !== value.trim()) {
    options.name = StringUtils.splice(
      value, dataTypeClosureResult.index, dataType.length + 2).trim();
  } else if (!dataTypeClosure) {
    parserLogger.warn(tag.TagParser, "@member tag should have a {DataType}");
  }

  options.dataType = parseDataType(dataType);

  return {
    name: "member",
    type: "MemberTag",
    dataType: options.dataType,
  };
}
