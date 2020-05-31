// @flow
import type {Doc, PropertyTag} from "@webdoc/types";
import {createDoc} from "@webdoc/model";
import {matchDataTypeClosure, StringUtils} from "./helper";

// @property {DataType} simpleName - description
// @property {DataType} simpleName=dataValue - description
// @property {DataType} simpleName="data value" - description
// @property {DataType} [simpleName=defaultValue] - description

// Extract the data-value from the given string. It is expected that preceeding tokens are removed
// & the data-value is the first thing in the string.
export function extractDataValue(value: string): any {
  if (value.startsWith("\"")) {
    // Match everything until ending quote
    return /"([^"])*"/.exec(value);
  }

  return /(\w)+/.exec(value);
}

// Extract simpleName & defaultValue when passing simpleName=defaultValue
export function extractDefaultValueClosureData(closure: string): {
  simpleName: string,
  defaultValue: string
} {
  const splitIndex = closure.indexOf("=");

  // simpleName without defaultValue
  if (splitIndex === -1) {
    return {simpleName: closure};
  }

  return {
    simpleName: closure.slice(0, splitIndex),
    defaultValue: closure.slice(splitIndex + 1),
  };
}

export function parseProperty(value: string, doc: $Shape<Doc>): PropertyTag {
  // Extract "{DataType}" regexp-match from the tag value
  const dataTypeClosure = matchDataTypeClosure(value);
  let dataType;

  if (dataTypeClosure) {
    dataType = dataTypeClosure[0].slice(1, -1);
    value = StringUtils.del(value, dataTypeClosure).trimStart();
  }

  // Extract propertyName from the value
  const nameMatch = /^([\w$])+/.exec(value);
  let name = "";

  if (nameMatch) {
    name = nameMatch[0];
    value = StringUtils.del(value, nameMatch).trimStart();
  }

  let dataValue;
  let defaultValue;
  let optional = false;

  // propertyName is inside "[propertyName = defaultValue]"
  if (!name && value.startsWith("[")) {
    const defaultValueClosure = /\[([^\]])*\]/.exec(value);

    if (defaultValueClosure) {
      const closureData = extractDefaultValueClosureData(defaultValueClosure[0].slice(1, -1));

      name = closureData.simpleName;
      defaultValue = closureData.defaultValue;
      optional = true;

      value = StringUtils.del(value, defaultValueClosure).trimStart();
    }
  }// eslint-disable-line brace-style
  // Extract propertyName = "dataValue"
  //                        ?^^^^^^^^^?
  else if (value.startsWith("=")) {
    value = value.slice(1).trimStart();

    const dataValueMatch = extractDataValue(value);

    if (dataValueMatch) {
      dataValue = dataValueMatch[0];
      value = StringUtils.del(value, dataValueMatch).trimStart();
    }
  }

  if (value.startsWith("-")) {
    value = value.slice(1).trimStart();
  }

  const description = value;

  if (!doc.members) {
    doc.members = [];
  }

  doc.members.push(createDoc(name, "PropertyDoc", {
    object: null,
    constant: !!dataValue,
    dataType: [dataType, dataType],
    dataValue,
    defaultValue,
    description,
    optional,
    scope: "default", // related-resolution doctree-mod will resolve this
  }));

  return {
    name: "property",
    dataType: [dataType, dataType],
    description,
    type: "PropertyTag",
  };
}
