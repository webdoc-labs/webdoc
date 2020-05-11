import {parserLogger, tag} from "../Logger";
import type {MemberTag} from "@webdoc/types";

// Parses @member {DataType} tags (no description)
export function parseMember(value: string, options: any): MemberTag {
  // Extract {DataType}
  const dataTypeClosureResult = /{([^{}])+}/.exec(value);
  const dataTypeClosure = dataTypeClosureResult ? dataTypeClosureResult[0] : "";

  if (dataTypeClosure && dataTypeClosure !== value) {
    parserLogger.warn(tag.TagParser, "@member tag does not accept a description");
  } else if (!dataTypeClosure) {
    parserLogger.warn(tag.TagParser, "@member tag should have a {DataType}");
  }

  const dataType = dataTypeClosure.slice(1, -1);
  options.dataType = [dataType, dataType];

  return {
    name: "member",
    type: "MemberTag",
    dataType: options.dataType,
  };
}
