import type {DataType} from "@webdoc/types";
import catharsis from "catharsis";

// Whether the object is a DataType
export function isDataType(obj: any): boolean {
  return Array.isArray(obj) && typeof obj.template !== "undefined";
}

// Create a blank data-type
export function createDataType(): DataType {
  const dataType = [""];

  dataType.template = "";

  return dataType;
}

// Create a data-type based on a keyword (not a documentable type)
// Examples: boolean, object, number
export function createSimpleKeywordType(keyword: string): DataType {
  const dataType = [keyword];

  dataType.template = keyword;

  return dataType;
}

// Create a data-type based on a documentable type
// Example: ClassName, TypedefName, FunctionName
export function createSimpleDocumentedType(name: string): DataType {
  const dataType = [name, name];

  dataType.template = "%1";

  return dataType;
}

// Create a complex data-type with an operator on two sub data-types. You should add
// spaces around the operator as well.
export function createComplexType(operator: string, ...subtypes: DataType): DataType {
  if (subtypes.length === 0) {
    return createSimpleKeywordType("");
  }

  let len = subtypes[0].length;

  for (let i = 1; i < subtypes.length; i++) {
    len += subtypes[i].length - 1;
  }

  let raw = "";
  let template = "";
  const dataType = new Array(len);

  let i = 1;

  for (let j = 0; j < subtypes.length; j++) {
    const subtype = subtypes[j];
    let subtypeTemplate = subtype.template;

    raw += (j ? operator : "") + subtype[0];

    for (let k = 1; k < subtype.length; k++, i++) {
      dataType[i] = subtype[k];

      subtypeTemplate = subtypeTemplate.replace(`%${k}`, `%${i}`);
    }

    template += (j ? operator : "") + subtypeTemplate;
  }

  dataType[0] = raw;
  dataType.template = template;

  return dataType;
}

export function createRestDataType(inner: DataType): DataType {
  const dataType = new Array(inner.length);

  dataType[0] = `...${inner[0]}`;
  dataType.template = `...${inner.template}`;

  for (let i = 1; i < inner.length; i++) {
    dataType[i] = inner[i];
  }

  return dataType;
}

export function createFunctionType(
  paramTypes: DataType[],
  returnType: ?DataType,
): void {
  let raw = "(";
  let template = "(";
  const dataType = new Array(1);

  let i = 1;

  for (let j = 0; j < paramTypes.length; j++) {
    const paramType = paramTypes[j];

    if (!paramType) {
      continue;
    }

    let paramTemplate = paramType.template;

    dataType.length += paramType.length - 1;

    for (let k = 1; k < paramType.length; k++, i++) {
      dataType[i] = paramType[k];
      paramTemplate = paramTemplate.replace(`%${k}`, `%${i}`);
    }

    if (j + 1 < paramTypes.length) {
      raw += paramType[0] + ", ";
      template += paramTemplate + ", ";
    } else {
      raw += paramType[0];
      template += paramTemplate;
    }
  }

  raw += ")";
  template += ")";

  if (returnType) {
    dataType.length += returnType.length - 1;
    let returnTemplate = returnType[0];

    for (let j = 1; j < returnType.length; j++, i++) {
      dataType[i] = returnType[j];
      returnTemplate = returnTemplate.replace(`%${j}`, `%${i}`);
    }

    raw += ` => ${returnType[0]}`;
    template += ` => ${returnTemplate}`;
  }

  dataType[0] = raw;
  dataType.template = template;

  return dataType;
}

// Clones the data-type
export function cloneType(type: DataType): DataType {
  const clone = new Array(type.length);

  for (let i = 0; i < type.length; i++) {
    clone[i] = type[i];
  }

  clone.template = type.template;

  return clone;
}

const keywords = {
  "any": true,
  "boolean": true,
  "string": true,
  "void": true,
  "never": true,
  "undefined": true,
  "null": true,
  "object": true,
  "Object": true,
  "BigInt": true,
  "Symbol": true,
};

// Parse a string or Catharsis grammar into a simple tokenized DataType
export function parseDataType(exp: string | any): DataType {
  if (typeof exp === "string") {
    try {
      return parseDataType(catharsis.parse(exp, {jsdoc: true}));
    } catch (e) {
      console.error("Catharsis failed to parse: " + exp);
      return "unknown";
    }
  }

  if (exp.type === "NameExpression") {
    let dataType;

    if (exp.reservedWord || keywords[exp.name]) {
      dataType = createSimpleKeywordType(exp.name);
    } else {
      dataType = createSimpleDocumentedType(exp.name);
    }

    if (typeof exp.nullable !== "undefined") {
      if (exp.nullable) {
        dataType[0] = "?" + dataType[0];
        dataType.template = "?" + dataType.template;
      } else {
        dataType[0] = "!" + dataType[0];
        dataType.template = "!" + dataType.template;
      }
    }

    return dataType;
  }

  if (exp.type === "TypeApplication") {
    const typeParameters = createComplexType(", ", ...exp.applications.map((appl) => {
      return parseDataType(appl);
    }));

    typeParameters[0] = `<${typeParameters[0]}>`;
    typeParameters.template = `<${typeParameters.template}>`;

    const name = parseDataType(exp.expression);

    // Join name & <typeParameters>
    return createComplexType("", name, typeParameters);
  }

  if (exp.type === "TypeUnion") {
    return createComplexType(" | ", ...exp.elements.map((elem) => parseDataType(elem)));
  }

  if (exp.type === "FunctionType") {
    if (exp.params.length === 0 && !exp.result) {
      return createSimpleKeywordType("Function");
    }

    return createFunctionType(
      exp.params.map((param) => parseDataType(param)),
      exp.result ? parseDataType(exp.result) : null);
  }

  // webdoc says ^sorry^
  return createSimpleKeywordType("unknown");
}
