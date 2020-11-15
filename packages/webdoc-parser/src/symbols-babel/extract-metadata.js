// @flow

// This file has helper functions for extracting metadata from AST nodes.

import {
  type ClassDeclaration,
  type ClassExpression,
  type ClassMethod,
  type FunctionDeclaration,
  type FunctionExpression,
  type InterfaceDeclaration,
  type ObjectMethod,
  type TSInterfaceDeclaration,
  type TSMethodSignature,
  type TSType,
  type TSTypeAnnotation,
  isAssignmentPattern,
  isClassDeclaration,
  isClassExpression,
  isClassImplements,
  isIdentifier,
  isObjectExpression,
  isRestElement,
  isStringLiteral,
  isTSAnyKeyword,
  isTSArrayType,
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
  isTSTypePredicate,
  isTSTypeQuery,
  isTSTypeReference,
  isTSUndefinedKeyword,
  isTSUnionType,
  isTSUnknownKeyword,
  isTSVoidKeyword,
  isTypeAnnotation,
  isVoidTypeAnnotation,
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

import type {Symbol} from "../types/Symbol";

// Extracts all the extended class/interface names
export function extractExtends(
  node: ClassDeclaration | ClassExpression | InterfaceDeclaration | TSInterfaceDeclaration,
): ?Array<string | Symbol> {
  if (isClassDeclaration(node) || isClassExpression(node)) {
    if (isIdentifier(node.superClass)) {
      return [node.superClass.name];
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
      } else {
        // TODO: TSQualifiedName
        return "";
      }
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
    const paramNode = nodeParams[i];

    let param: ?$Shape<Param>;

    // TODO: Infer types
    if (isIdentifier(paramNode)) {
      param = {
        identifier: paramNode.name,
        optional: paramNode.optional || false,
      };
    } else if (isRestElement(paramNode)) {
      param = {
        identifier: paramNode.argument.name,
        optional: paramNode.optional || false,
        variadic: true,
      };
    } else if (isAssignmentPattern(paramNode)) {
      param = {
        identifier: paramNode.left.name,
        optional: paramNode.optional || false,
        default: paramNode.right.raw,
      };
    } else if (isObjectExpression(paramNode)) {
      // TODO: Find a way to document {x, y, z} parameters
      // e.g. function ({x, y, z}), you would need to give the object pattern an anonymous like
      // "", " ", "  ",  "    " or using &zwnj; because it is truly invisible

      ((params: any)).flawed = true;
      console.error("Object patterns as parameters can't be documented");
    } else {
      ((params: any)).flawed = true;
      console.error("Parameter node couldn't be parsed");
    }

    if (param && paramNode.typeAnnotation) {
      param.dataType = resolveDataType(paramNode.typeAnnotation);
    }
    if (param) {
      params.push(param);
    }
  }

  return params;
}

// Extract the returns for the method/function
export function extractReturns(
  node: ClassMethod | ObjectMethod | FunctionDeclaration | FunctionExpression,
): $Shape<Return>[] {
  if (node.returnType) {
    return [{dataType: resolveDataType(node.returnType)}];
  }
  if (node.typeAnnotation) {
    return [{dataType: resolveDataType(node.typeAnnotation)}];
  }

  return [];
}

// Extract the data-type for a property
export function extractType(node: any): ?DataType {
  if (node.typeAnnotation) {
    return resolveDataType(node.typeAnnotation);
  }
}

// Resolve a type-annotation into a parsed DataType
function resolveDataType(type: TSTypeAnnotation | TSType | any): DataType {
  if (isTypeAnnotation(type) || isTSTypeAnnotation(type)) {
    return resolveDataType(type.typeAnnotation);
  }
  if (isIdentifier(type) && type.typeAnnotation) {
    const dataType = cloneType(resolveDataType(type.typeAnnotation));

    dataType[0] = type.name + ": " + dataType[0];
    dataType.template = type.name + ": " + dataType.template;

    return dataType;
  }

  if (isIdentifier(type)) {
    return createSimpleDocumentedType(type.name);
  } else if (isTSQualifiedName(type)) { // TSQualifiedName
    let name = "";

    while (type && !isIdentifier(type)) {
      name = type.right.name + (name ? "." : "") + name;
      type = type.left;
    }

    if (type) {
      name = type.name + "." + name;
    }

    return createSimpleDocumentedType(name);
  }

  if (isTSType(type)) {
    if (isTSTypeReference(type)) {
      return resolveDataType(type.typeName);
    }

    if (isTSAnyKeyword(type)) {
      return createSimpleKeywordType("any");
    }
    if (isTSArrayType(type)) {
      const dataType = resolveDataType(type.elementType);

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
        type.parameters.map((param) => resolveDataType(param)),
        type.typeAnnotation ? resolveDataType(type.typeAnnotation) : null,
      );
    }
    if (isTSRestType(type)) {
      return createRestDataType(resolveDataType(type.typeAnnotation));
    }
    if (isTSUnionType(type)) {
      return createComplexType(" | ", ...type.types.map((subtype) => resolveDataType(subtype)));
    }
    if (isTSIntersectionType(type)) {
      return createComplexType(" & ", ...type.types.map((subtype) => resolveDataType(subtype)));
    }
    if (isTSTupleType(type)) {
      const dataType = createComplexType(", ",
        ...type.elementTypes.map((subtype) => resolveDataType(subtype)));

      dataType[0] = `[${dataType[0]}]`;
      dataType.template = `[${dataType.template}]`;

      return dataType;
    }
    if (isTSParenthesizedType(type)) {
      const dataType = cloneType(resolveDataType(type.typeAnnotation));

      dataType[0] = `(${dataType[0]})`;
      dataType.template = `(${dataType.template})`;

      return dataType;
    }
    if (isTSTypePredicate(type)) {
      const dataType = cloneType(resolveDataType(type.typeAnnotation));

      dataType[0] = `${type.parameterName.name} is ${dataType[0]}`;
      dataType.template = `${type.parameterName.name} is ${dataType.template}`;

      return dataType;
    }
    if (isTSTypeQuery(type)) {
      const dataType = resolveDataType(type.exprName);

      dataType[0] = `typeof ${dataType[0]}`;
      dataType.template = `typeof ${dataType.template}`;

      return dataType;
    }
    if (isTSMappedType(type)) {
      const dataType = resolveDataType(type.typeAnnotation);
      const name = type.typeParameter.name;
      const operator = type.typeParameter.constraint.operator;
      const constraintType = resolveDataType(type.typeParameter.constraint);

      const attribs = `${type.readonly ? "readonly " : ""}${type.static ? "static " : ""}`;

      constraintType[0] = `{ ${attribs}[${name} in ${operator} ${constraintType[0]}] }`;
      constraintType.template = `{ ${attribs}[${name} in ${operator} ${constraintType.template}] }`;

      return createComplexType(": ", constraintType, dataType);
    }
  }

  if (isTSTypeLiteral(type)) {
    const dataType = createComplexType(", ", ...type.members.map((mem) => resolveDataType(mem)));

    dataType[0] = "{ " + dataType[0] + " }";
    dataType.template = `{ ${dataType.template} }`;

    return dataType;
  }
  if (isTSIndexedAccessType(type)) {
    const index = resolveDataType(type.indexType);

    index[0] = `[${index[0]}]`;
    index.template = `[${index.template}]`;

    const object = resolveDataType(type.objectType);

    return createComplexType("", object, index);
  }
  if (isTSPropertySignature(type)) {
    const dataType = resolveDataType(type.typeAnnotation);
    const key = (type.key.name || `[${type.key.value}]`) + (type.optional ? "?" : "");

    const attribs = `${type.readonly ? "readonly " : ""}${type.static ? "static " : ""}`;

    dataType[0] = `${attribs}${key} : ${dataType[0]}`;
    dataType.template = `${attribs}${key} : ${dataType.template}`;

    return dataType;
  }
  if (isTSIndexSignature(type)) {
    const params = createComplexType(", ", ...type.parameters.map((param) => {
      return resolveDataType(param);
    }));

    params[0] = `[${params[0]}]`;
    params.template = `[${params.template}]`;

    const dataType = createComplexType(": ", params, resolveDataType(type.typeAnnotation));

    return dataType;
  }
  if (isTSConstructSignatureDeclaration(type)) {
    const params = createComplexType(", ", ...type.parameters.map((param) => {
      return resolveDataType(param);
    }));

    params[0] = `new (${params[0]})`;
    params.template = `new (${params.template})`;

    if (type.typeAnnotation) {
      return createComplexType(": ", params, resolveDataType(type.typeAnnotation));
    } else {
      return params;
    }
  }
  if (isTSTypeOperator(type)) {
    if (type.operator) {
      return createSimpleKeywordType(type.operator);
    }
  }

  if (isVoidTypeAnnotation(type)) {
    return createSimpleKeywordType("void");
  }
  if (isRestElement(type)) {
    const dataType = resolveDataType(type.typeAnnotation);

    dataType[0] = `...${type.argument.name}: ${dataType[0]}`;
    dataType.template = `...${type.argument.name}: ${dataType.template}`;

    return dataType;
  }

  console.log(type);
  console.log("***unknown data-type node***");

  // webdoc says ^sorry^
  return createSimpleKeywordType("unknown");
}
