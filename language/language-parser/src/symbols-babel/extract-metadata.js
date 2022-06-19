// @flow

// This file has helper functions for extracting metadata from AST nodes.

import {
  type BabelNodeExpression,
  type BabelNodeFlow,
  type BabelNodeMemberExpression,
  type BabelNodeObjectExpression,
  type BabelNodeObjectTypeAnnotation,
  type BabelNodeQualifiedName,
  type BabelNodeTSLiteralType,
  type BabelNodeTSTypeAnnotation,
  type BabelNodeTypeAnnotation,
  type BabelTSTypeAnnotation,
  type ClassDeclaration,
  type ClassExpression,
  type ClassMethod,
  type FunctionDeclaration,
  type FunctionExpression,
  type InterfaceDeclaration,
  type ObjectMethod,
  type ObjectPattern,
  type TSInterfaceDeclaration,
  type TSMethodSignature,
  type TSQualifiedName,
  type TSType,
  type TSTypeAnnotation,
  isAnyTypeAnnotation,
  isArrayTypeAnnotation,
  isAssignmentPattern,
  isBooleanLiteral,
  isBooleanLiteralTypeAnnotation,
  isBooleanTypeAnnotation,
  isClassDeclaration,
  isClassExpression,
  isClassImplements,
  isExpression,
  isFlowType,
  isFunctionTypeAnnotation,
  isFunctionTypeParam,
  isGenericTypeAnnotation,
  isIdentifier,
  isIntersectionTypeAnnotation,
  isLiteral,
  isMemberExpression,
  isMixedTypeAnnotation,
  isNullLiteralTypeAnnotation,
  isNullableTypeAnnotation,
  isNumberLiteralTypeAnnotation,
  isNumberTypeAnnotation,
  isNumericLiteral,
  isObjectPattern,
  isObjectProperty,
  isObjectTypeAnnotation,
  isObjectTypeIndexer,
  isObjectTypeProperty,
  isQualifiedTypeIdentifier,
  isRestElement,
  isStringLiteral,
  isStringLiteralTypeAnnotation,
  isStringTypeAnnotation,
  isTSAnyKeyword,
  isTSArrayType,
  isTSAsExpression,
  isTSBigIntKeyword,
  isTSBooleanKeyword,
  isTSConstructSignatureDeclaration,
  isTSConstructorType,
  isTSExpressionWithTypeArguments,
  isTSFunctionType,
  isTSIndexSignature,
  isTSIndexedAccessType,
  isTSIntersectionType,
  isTSLiteralType,
  isTSMappedType,
  isTSNeverKeyword,
  isTSNullKeyword,
  isTSNumberKeyword,
  isTSObjectKeyword,
  isTSParameterProperty,
  isTSParenthesizedType,
  isTSPropertySignature,
  isTSQualifiedName,
  isTSRestType,
  isTSStringKeyword,
  isTSSymbolKeyword,
  isTSThisType,
  isTSTupleType,
  isTSType,
  isTSTypeAnnotation,
  isTSTypeLiteral,
  isTSTypeOperator,
  isTSTypeParameterInstantiation,
  isTSTypePredicate,
  isTSTypeQuery,
  isTSTypeReference,
  isTSUndefinedKeyword,
  isTSUnionType,
  isTSUnknownKeyword,
  isTSVoidKeyword,
  isThisExpression,
  isThisTypeAnnotation,
  isTupleTypeAnnotation,
  isTypeAnnotation,
  isTypeParameterInstantiation,
  isTypeofTypeAnnotation,
  isUnaryExpression, isUnionTypeAnnotation, isVoidTypeAnnotation,
} from "@babel/types";

import type {DataType, Param, Return} from "@webdoc/types";

import {
  cloneType,
  createComplexType,
  createFunctionType,
  createRestDataType,
  createSimpleDocumentedType,
  createSimpleKeywordType,
} from "@webdoc/model";

import {parserLogger, tag} from "../Logger";
import type {Symbol} from "../types/Symbol";

export const mode: {
  current: "typescript" | "flow",
} = {
  current: "typescript",
};

// Extracts all the extended class/interface names
export function extractExtends(
  node: ClassDeclaration | ClassExpression | InterfaceDeclaration | TSInterfaceDeclaration,
): ?Array<string | Symbol> {
  if (isClassDeclaration(node) || isClassExpression(node)) {
    if (isIdentifier(node.superClass)) {
      return [node.superClass.name];
    }
    if (isMemberExpression(node.superClass)) {
      return [reduceMemberExpression(node.superClass)];
    }

    return null;
  }
  if (!node.extends) {
    return;
  }

  return node.extends.map((exs) => {
    if (isIdentifier(exs.id)) {
      return exs.id.name;
    }
    if (isQualifiedTypeIdentifier(exs.id)) {
      return reduceQualifiedName(exs.id);
    }
    if (isIdentifier(exs.expression)) {
      return exs.expression.name;
    }
    if (isTSQualifiedName(exs.expression)) {
      return reduceTSQualifiedName(exs.expression);
    }

    // TODO: QualifiedTypeIdentifier
    return "";
  });
}

// Extracts all the implemented interface names
export function extractImplements(
  node: ClassDeclaration | ClassExpression,
): ?Array<string | Symbol> {
  return node.implements ? node.implements.map((impls) => {
    if (isClassImplements(impls)) {
      return impls.id.name;
    }
    if (isTSExpressionWithTypeArguments(impls)) {
      if (isIdentifier(impls.expression)) {
        return impls.expression.name;
      }
      if (isQualifiedTypeIdentifier(impls.id)) {
        return reduceQualifiedName(impls.id);
      }
      if (isIdentifier(impls.expression)) {
        return impls.expression.name;
      }
      if (isTSQualifiedName(impls.expression)) {
        return reduceTSQualifiedName(impls.expression);
      }

      return "";
    }
  }) : null;
}

// Extract all the parameter-data from the method/function AST node
export function extractParams(
  node: ClassMethod | FunctionDeclaration | FunctionExpression | TSMethodSignature,
): $Shape<Param>[] {
  if (!node.params && !node.parameters) {
    return [];
  }

  const nodeParams = node.params ? node.params : node.parameters;

  const params: Param[] = [];

  for (let i = 0; i < nodeParams.length; i++) {
    let paramNode = nodeParams[i];
    let param: ?$Shape<Param>;
    let paramTypeAnnotation: ?BabelTSTypeAnnotation;

    if (isTSParameterProperty(paramNode)) {
      paramNode = paramNode.parameter;
    }

    // TODO: Infer types
    if (isIdentifier(paramNode)) {
      param = {
        identifier: paramNode.name,
        optional: paramNode.optional || false,
      };
    } else if (isRestElement(paramNode)) {
      const argument = paramNode.argument;

      param = {
        identifier: isIdentifier(argument) ? argument.name : "rest_args",
        optional: paramNode.optional || false,
        variadic: true,
      };
    } else if (isAssignmentPattern(paramNode)) {
      const extraRaw = paramNode.right.extra && paramNode.right.extra.raw;
      const [defaultValue, dataType] = extractAssignedValue(paramNode.right);

      if (isObjectPattern(paramNode.left)) {
        try {
          params.push(({
            identifier: `__arg${i}`,
            optional: false,
            ...(paramNode.left.typeAnnotation && {
              dataType: extractType(paramNode.left.typeAnnotation),
            }),
          }: $Shape<Param>));
          params.push(...extractParamsFromObjectPatternRecursive(
            paramNode.left, paramNode.right,
            paramNode.left.typeAnnotation ? paramNode.left.typeAnnotation.typeAnnotation : null));
        } catch (e) {
          ((params: any)).flawed = true;
          parserLogger.error(tag.Indexer, `Failed parse param: ${e}`);
        }
      } else {
        param = {
          identifier: paramNode.left.name,
          optional: paramNode.optional || false,
          default: paramNode.right.raw || extraRaw || defaultValue,
          dataType,
        };
        // This will override the inferred data type.
        paramTypeAnnotation = paramNode.left.typeAnnotation;
      }
    } else if (isObjectPattern(paramNode)) {
      // TODO: Find a way to document {x, y, z} parameters
      // e.g. function ({x, y, z}), you would need to give the object pattern an anonymous like
      // "", " ", "  ",  "    " or using &zwnj; because it is truly invisible

      try {
        params.push(({
          identifier: `__arg${i}`,
          optional: false,
          ...(paramNode.typeAnnotation && {
            dataType: extractType(paramNode.typeAnnotation),
          }),
        }: $Shape<Param>));
        params.push(...extractParamsFromObjectPatternRecursive(
          paramNode, null,
          paramNode.typeAnnotation ? paramNode.typeAnnotation.typeAnnotation : null));
      } catch (e) {
        ((params: any)).flawed = true;
        parserLogger.error(tag.Indexer, `Failed parse param: ${e}`);
      }
    } else {
      ((params: any)).flawed = true;
      parserLogger.error(tag.Indexer, "Parameter node couldn't be parsed, " +
          "enable warning logs for more detail");
      parserLogger.warn(tag.Indexer, JSON.stringify(paramNode, null, 2));
    }

    if (param && paramTypeAnnotation) {
      param.dataType = extractType(paramTypeAnnotation);
    } else if (param && paramNode.typeAnnotation) {
      param.dataType = extractType(paramNode.typeAnnotation);
    }

    if (param) {
      params.push(param);
    }
  }

  return params;
}

function extractParamsFromObjectPatternRecursive(
  left: ObjectPattern,
  right?: ?BabelNodeObjectExpression,
  typeAnnotation?: BabelNodeObjectTypeAnnotation | BabelNodeTSLiteralType,
): Param[] {
  const params: Param[] = [];

  for (const prop of left.properties) {
    if (isObjectProperty(prop)) {
      let defaultValue: any;

      if (isAssignmentPattern(prop.value)) {
        defaultValue = prop.value.right;
      } else if (right) {
        for (const defaultValueProp of right.properties) {
          if (defaultValueProp.key && defaultValueProp.key.name === prop.key.name) {
            defaultValue = defaultValueProp.value;
            break;
          }
        }
      }

      let valueTypeAnnotation: any;

      if (typeAnnotation && isObjectTypeAnnotation(typeAnnotation)) {
        for (const typeProp of typeAnnotation.properties) {
          if (isIdentifier(typeProp.key) && typeProp.key.name === prop.key.name) {
            valueTypeAnnotation = {typeAnnotation: typeProp.value};
            break;
          }
        }
      } else if (typeAnnotation && isTSTypeLiteral(typeAnnotation)) {
        for (const typeProp of typeAnnotation.members) {
          if (isIdentifier(typeProp.key) && typeProp.key.name === prop.key.name) {
            valueTypeAnnotation = typeProp.typeAnnotation;
            break;
          }
        }
      }

      if (isObjectPattern(prop.value)) {
        const embeddedParams = extractParamsFromObjectPatternRecursive(
          prop.value,
          defaultValue,
          valueTypeAnnotation ? valueTypeAnnotation.typeAnnotation : null,
        );
        const prefix = isIdentifier(prop.key) ? prop.key.name : "$error$";

        for (const embeddedParam of embeddedParams) {
          embeddedParam.identifier = `.${prefix}${embeddedParam.identifier}`;
        }

        params.push(...embeddedParams);
      } else if (isIdentifier(prop.key)) {
        const [defaultValueRaw, impliedDataType] = defaultValue ?
          extractAssignedValue(defaultValue) : [null, null];

        // Prefix with dot so it's implied to be not top-level
        const param: $Shape<Param> = {
          identifier: "." + prop.key.name,
          optional: valueTypeAnnotation && valueTypeAnnotation.optional,
          variadic: false,
          ...(defaultValueRaw && {default: defaultValueRaw}),
          dataType: valueTypeAnnotation ? extractType(valueTypeAnnotation) : impliedDataType,
        };

        params.push(param);
      }
    }
  }

  return params;
}

// Extract the returns for the method/function
export function extractReturns(
  node: ClassMethod | ObjectMethod | FunctionDeclaration | FunctionExpression,
): $Shape<Return>[] {
  if (node.returnType) {
    return [{dataType: extractTypeFailsafe(node.returnType)}];
  }
  if (node.typeAnnotation) {
    return [{dataType: extractTypeFailsafe(node.typeAnnotation)}];
  }

  return [];
}

// Used to get default value
// TODO: Resolve a lot more expressions
export function extractRawExpression(expression: BabelNodeExpression): string | void {
  if (isLiteral(expression)) {
    if (isStringLiteral(expression)) {
      return `"${expression.value}"`;
    } else {
      return `${expression.value}`;
    }
  }
  if (isUnaryExpression(expression)) {
    return `-${extractRawExpression(expression.argument) || ""}`;
  }
}

export function extractAssignedValue(node: BabelNodeExpression): [?string, ?DataType] {
  let defaultValue: ?string;
  let dataType: ?DataType;

  if (isLiteral(node)) {
    if (isStringLiteral(node)) {
      // Quotes for strings
      defaultValue = `"${node.value}"`;

      dataType = createSimpleKeywordType("string");
    } else {
      defaultValue = `${node.value}`;

      if (isNumericLiteral(node)) {
        dataType = createSimpleKeywordType("number");
      } else if (isBooleanLiteral(node)) {
        dataType = createSimpleKeywordType("boolean");
      }
    }
  } else if (isExpression(node)) {
    defaultValue = extractRawExpression(node);

    if (typeof defaultValue === "string") {
      if (!isNaN(parseFloat(defaultValue))) {
        dataType = createSimpleKeywordType("number");
      }
    }
  }

  return [defaultValue, dataType];
}

// Failsafe
export function extractTypeFailsafe(
  node: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | any,
): DataType {
  if (node.typeAnnotation) {
    if (isFlowType(node.typeAnnotation) || mode.current === "flow") {
      return resolveFlowDataType(node.typeAnnotation);
    }

    return resolveTSDataType(node.typeAnnotation);
  }

  console.error(node);
  console.error("Failsafe type extraction found invalid type.");

  return createSimpleKeywordType("invalid");
}

// Extract the data-type for a property
export function extractType(
  node: BabelNodeTypeAnnotation | BabelNodeTSTypeAnnotation | any,
): ?DataType {
  if (node.typeAnnotation) {
    if (isFlowType(node.typeAnnotation) || mode.current === "flow") {
      return resolveFlowDataType(node.typeAnnotation);
    }

    return resolveTSDataType(node.typeAnnotation);
  }
}

// Helper to resolve assignment to object chain, e.g. [Class.prototype].property
function reduceMemberExpression(expression: BabelNodeMemberExpression): string {
  let longname = "";

  if (isTSAsExpression(expression)) {
    expression = expression.expression;
  }
  if (isThisExpression(expression)) {
    return "this";
  }

  while (expression.object) {
    longname = expression.property.name + (longname ? "." + longname : "");
    expression = expression.object;
  }

  longname = (isThisExpression(expression) ? "this" : expression.name) +
    (longname ? "." : "") + longname;

  return longname;
}

// Reduce the qualified name into a string
function reduceQualifiedName(type: BabelNodeQualifiedName): string {
  let name = "";

  while (type && !isIdentifier(type)) {
    name = type.id.name + (name ? "." : "") + name;
    type = type.qualification;
  }

  if (type) {
    name = type.name + "." + name;
  }

  return name;
}

// Reduce the qualified name node into a string
function reduceTSQualifiedName(type: TSQualifiedName): string {
  let name = "";

  while (type && !isIdentifier(type)) {
    name = type.right.name + (name ? "." : "") + name;
    type = type.left;
  }

  if (type) {
    name = type.name + "." + name;
  }

  return name;
}

// Resolve a flow type-annotation into a parsed DataType
function resolveFlowDataType(type: BabelNodeTypeAnnotation | BabelNodeFlow | any): DataType {
  if (isTypeAnnotation(type)) {
    return resolveFlowDataType(type.typeAnnotation);
  }

  if (isIdentifier(type)) {
    return createSimpleDocumentedType(type.name);
  }
  if (isFunctionTypeParam(type)) {
    const name = type.name ? type.name.name : "";
    const dataType = cloneType(resolveFlowDataType(type.typeAnnotation));

    dataType[0] = name + ": " + dataType[0];
    dataType.template = name + ": " + dataType.template;

    return dataType;
  }
  if (isGenericTypeAnnotation(type)) {
    let dataType = resolveFlowDataType(type.id);

    if (type.typeParameters) {
      const typeParamsDataType = resolveFlowDataType(type.typeParameters);

      console.log(typeParamsDataType);

      if (typeParamsDataType) {
        dataType = createComplexType("", dataType, typeParamsDataType);
      }
    }

    return dataType;
  }
  if (isTypeParameterInstantiation(type)) {
    const dataType = createComplexType(", ",
      ...type.params.map((param) => resolveFlowDataType(param)));

    dataType[0] = `<${dataType[0]}>`;
    dataType.template = `<${dataType.template}>`;

    return dataType;
  }
  if (isObjectTypeProperty(type)) {
    const key = isStringLiteral(type) ? `"${type.key.value}"` : type.key.name;
    const dataType = resolveFlowDataType(type.value);

    const prefix = type.kind !== "init" ? `${type.kind} ` : "";
    const suffix = type.kind !== "init" ? "()" : "";
    const separator = type.optional ? "?:" : ":";

    dataType[0] = `${prefix}${key}${suffix}${separator} ${dataType[0]}`;
    dataType.template = `${prefix}${key}${suffix}${separator} ${dataType.template}`;

    return dataType;
  }
  if (isQualifiedTypeIdentifier(type)) {
    return createSimpleDocumentedType(reduceQualifiedName(type));
  }
  if (isObjectTypeIndexer(type)) {
    const id = type.id ? type.id.name : null;
    const key = resolveFlowDataType(type.key);
    const value = resolveFlowDataType(type.value);

    if (id !== null) {
      key[0] = `[${id}: ${key[0]}]`;
      key.template = `[${id} : ${key.template}]`;
    } else {
      key[0] = `[${key[0]}]`;
      key.template = `[${key.template}]`;
    }

    return createComplexType(": ", key, value);
  }

  if (isFlowType(type)) {
    if (isAnyTypeAnnotation(type)) {
      return createSimpleKeywordType("any");
    }
    if (isArrayTypeAnnotation(type)) {
      const dataType = resolveFlowDataType(type.elementType);

      dataType[0] += "[]";
      dataType.template += "[]";

      return dataType;
    }
    if (isBooleanTypeAnnotation(type)) {
      return createSimpleKeywordType("boolean");
    }
    if (isBooleanLiteralTypeAnnotation(type)) {
      return createSimpleKeywordType(`${type.value}`);
    }
    if (isNullLiteralTypeAnnotation(type)) {
      return createSimpleKeywordType("null");
    }
    if (isFunctionTypeAnnotation(type)) {
      const params = type.params.map((param) => resolveFlowDataType(param));

      if (type.rest) {
        params.push(createRestDataType(resolveFlowDataType(type.rest)));
      }

      return createFunctionType(
        params,
        type.returnType ? resolveFlowDataType(type.returnType) : null,
      );
    }
    if (isIntersectionTypeAnnotation(type)) {
      return createComplexType(" & ", type.types.map((type) => resolveFlowDataType(type)));
    }
    if (isMixedTypeAnnotation(type)) {
      return createSimpleKeywordType("mixed");
    }
    if (isNullableTypeAnnotation(type)) {
      const dataType = resolveFlowDataType(type.typeAnnotation);

      dataType[0] = `?${dataType[0]}`;
      dataType.template = `?${dataType.template}`;

      return dataType;
    }
    if (isNumberLiteralTypeAnnotation(type)) {
      return createSimpleKeywordType(`${type.value}`);
    }
    if (isNumberTypeAnnotation(type)) {
      return createSimpleKeywordType("number");
    }
    if (isObjectTypeAnnotation(type)) {
      const properties = (type.properties || []).map((prop) => resolveFlowDataType(prop));
      const indexers = (type.indexers || []).map((indexer) => resolveFlowDataType(indexer));

      const dataType = createComplexType(", ", ...properties, ...indexers);

      dataType[0] = `{ ${dataType[0]} }`;
      dataType.template = `{ ${dataType.template} }`;

      return dataType;
    }
    if (isStringLiteralTypeAnnotation(type)) {
      return createSimpleKeywordType(`"${type.value}"`);
    }
    if (isStringTypeAnnotation(type)) {
      return createSimpleKeywordType("string");
    }
    if (isThisTypeAnnotation(type)) {
      return createSimpleKeywordType("this");
    }
    if (isTupleTypeAnnotation(type)) {
      const dataType = createComplexType(", ", ...type.types.map((t) => resolveFlowDataType(t)));

      dataType[0] = `[${dataType[0]}]`;
      dataType.template = `[${dataType.template}]`;

      return dataType;
    }
    if (isTypeofTypeAnnotation(type)) {
      const dataType = resolveFlowDataType(type);

      dataType[0] = `typeof ${dataType[0]}`;
      dataType.template = `typeof ${dataType.template}`;

      return dataType;
    }
    if (isUnionTypeAnnotation(type)) {
      return createComplexType(" | ", ...type.types.map((t) => resolveFlowDataType(t)));
    }
    if (isVoidTypeAnnotation(type)) {
      return createSimpleKeywordType("void");
    }
  }

  console.log(type);
  console.log("***unknown (flow) data-type node***");

  // webdoc says ^sorry^ with a :(
  return createSimpleKeywordType("unknown");
}

// Resolve a typescript type-annotation into a parsed DataType
function resolveTSDataType(type: TSTypeAnnotation | TSType | any): DataType {
  if (isTypeAnnotation(type) || isTSTypeAnnotation(type)) {
    return resolveTSDataType(type.typeAnnotation);
  }
  if (isIdentifier(type) && type.typeAnnotation) {
    const dataType = cloneType(resolveTSDataType(type.typeAnnotation));

    dataType[0] = type.name + ": " + dataType[0];
    dataType.template = type.name + ": " + dataType.template;

    return dataType;
  }

  if (isIdentifier(type)) {
    return createSimpleDocumentedType(type.name);
  } else if (isTSQualifiedName(type)) { // TSQualifiedName
    return createSimpleDocumentedType(reduceTSQualifiedName(type));
  }

  if (isTSType(type)) {
    if (isTSTypeReference(type)) {
      let dataType = resolveTSDataType(type.typeName);

      if (type.typeParameters) {
        const typeParamsDataType = resolveTSDataType(type.typeParameters);

        if (typeParamsDataType) {
          dataType = createComplexType("", dataType, typeParamsDataType);
        }
      }

      return dataType;
    }

    if (isTSAnyKeyword(type)) {
      return createSimpleKeywordType("any");
    }
    if (isTSArrayType(type)) {
      const dataType = resolveTSDataType(type.elementType);

      dataType[0] += "[]";
      dataType.template += "[]";

      return dataType;
    }
    if (isTSBooleanKeyword(type)) {
      return createSimpleKeywordType("boolean");
    }
    if (isTSBigIntKeyword(type)) {
      // TODO: Does the user want to document a link to BigInt? (Low priority)
      return createSimpleKeywordType("BigInt");
    }
    if (isTSNeverKeyword(type)) {
      return createSimpleKeywordType("never");
    }
    if (isTSNullKeyword(type)) {
      return createSimpleKeywordType("null");
    }
    if (isTSNumberKeyword(type)) {
      return createSimpleKeywordType("number");
    }
    if (isTSObjectKeyword(type)) {
      return createSimpleKeywordType("object");
    }
    if (isTSStringKeyword(type)) {
      return createSimpleKeywordType("string");
    }
    if (isTSSymbolKeyword(type)) {
      // TODO: Does the user want to document a link to Symbol? (Low priority)
      // Hmm, this Symbol is different from ES6 Symbol
      return createSimpleKeywordType("Symbol");
    }
    if (isTSUndefinedKeyword(type)) {
      return createSimpleKeywordType("undefined");
    }
    if (isTSUnknownKeyword(type)) {
      return createSimpleKeywordType("unknown");
    }
    if (isTSVoidKeyword(type)) {
      return createSimpleKeywordType("void");
    }
    if (isTSThisType(type)) {
      return createSimpleDocumentedType("this");
    }
    if (isTSLiteralType(type)) {
      if (isStringLiteral(type.literal)) {
        return createSimpleKeywordType(`"${type.literal.value}"`);
      }

      return createSimpleKeywordType(type.literal.value);
    }
    if (isTSFunctionType(type) || isTSConstructorType(type)) {
      return createFunctionType(
        type.parameters.map((param) => resolveTSDataType(param)),
        type.typeAnnotation ? resolveTSDataType(type.typeAnnotation) : null,
      );
    }
    if (isTSRestType(type)) {
      return createRestDataType(resolveTSDataType(type.typeAnnotation));
    }
    if (isTSUnionType(type)) {
      return createComplexType(" | ", ...type.types.map((subtype) => resolveTSDataType(subtype)));
    }
    if (isTSIntersectionType(type)) {
      return createComplexType(" & ", ...type.types.map((subtype) => resolveTSDataType(subtype)));
    }
    if (isTSTupleType(type)) {
      const dataType = createComplexType(", ",
        ...type.elementTypes.map((subtype) => resolveTSDataType(subtype)));

      dataType[0] = `[${dataType[0]}]`;
      dataType.template = `[${dataType.template}]`;

      return dataType;
    }
    if (isTSParenthesizedType(type)) {
      const dataType = cloneType(resolveTSDataType(type.typeAnnotation));

      dataType[0] = `(${dataType[0]})`;
      dataType.template = `(${dataType.template})`;

      return dataType;
    }
    if (isTSTypePredicate(type)) {
      const dataType = cloneType(resolveTSDataType(type.typeAnnotation));

      dataType[0] = `${type.parameterName.name} is ${dataType[0]}`;
      dataType.template = `${type.parameterName.name} is ${dataType.template}`;

      return dataType;
    }
    if (isTSTypeQuery(type)) {
      const dataType = resolveTSDataType(type.exprName);

      dataType[0] = `typeof ${dataType[0]}`;
      dataType.template = `typeof ${dataType.template}`;

      return dataType;
    }
    if (isTSMappedType(type)) {
      const dataType = resolveTSDataType(type.typeAnnotation);
      const name = type.typeParameter.name;
      const operator = type.typeParameter.constraint.operator;
      const constraintType = resolveTSDataType(type.typeParameter.constraint);

      const attribs = `${type.readonly ? "readonly " : ""}${type.static ? "static " : ""}`;

      constraintType[0] = `{ ${attribs}[${name} in ${operator} ${constraintType[0]}] }`;
      constraintType.template = `{ ${attribs}[${name} in ${operator} ${constraintType.template}] }`;

      return createComplexType(": ", constraintType, dataType);
    }
  }

  if (isTSTypeLiteral(type)) {
    const dataType = createComplexType(", ", ...type.members.map((mem) => resolveTSDataType(mem)));

    dataType[0] = "{ " + dataType[0] + " }";
    dataType.template = `{ ${dataType.template} }`;

    return dataType;
  }
  if (isTSIndexedAccessType(type)) {
    const index = resolveTSDataType(type.indexType);

    index[0] = `[${index[0]}]`;
    index.template = `[${index.template}]`;

    const object = resolveTSDataType(type.objectType);

    return createComplexType("", object, index);
  }
  if (isTSPropertySignature(type)) {
    const dataType = resolveTSDataType(type.typeAnnotation);
    const key = (type.key.name || `[${type.key.value}]`) + (type.optional ? "?" : "");

    const attribs = `${type.readonly ? "readonly " : ""}${type.static ? "static " : ""}`;

    dataType[0] = `${attribs}${key} : ${dataType[0]}`;
    dataType.template = `${attribs}${key} : ${dataType.template}`;

    return dataType;
  }
  if (isTSIndexSignature(type)) {
    const params = createComplexType(", ", ...type.parameters.map((param) => {
      return resolveTSDataType(param);
    }));

    params[0] = `[${params[0]}]`;
    params.template = `[${params.template}]`;

    const dataType = createComplexType(": ", params, resolveTSDataType(type.typeAnnotation));

    return dataType;
  }
  if (isTSConstructSignatureDeclaration(type)) {
    const params = createComplexType(", ", ...type.parameters
      .map((param) => resolveTSDataType(param)));

    params[0] = `new (${params[0]})`;
    params.template = `new (${params.template})`;

    if (type.typeAnnotation) {
      return createComplexType(": ", params, resolveTSDataType(type.typeAnnotation));
    } else {
      return params;
    }
  }
  if (isTSTypeOperator(type)) {
    if (type.operator) {
      return createSimpleKeywordType(type.operator);
    }
  }
  if (isTSTypeParameterInstantiation(type)) {
    const typeParams = createComplexType(", ", ...type.params
      .map((param) => resolveTSDataType(param)));

    typeParams[0] = `<${typeParams[0]}>`;
    typeParams.template = `<${typeParams.template}>`;

    return typeParams;
  }

  if (isVoidTypeAnnotation(type)) {
    return createSimpleKeywordType("void");
  }
  if (isRestElement(type)) {
    const dataType = resolveTSDataType(type.typeAnnotation);

    dataType[0] = `...${type.argument.name}: ${dataType[0]}`;
    dataType.template = `...${type.argument.name}: ${dataType.template}`;

    return dataType;
  }

  console.log(type);
  console.log("***unknown (typescript) data-type node***");

  // webdoc says ^sorry^
  return createSimpleKeywordType("unknown");
}
