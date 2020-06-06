// @flow

// This file has helper functions for extracting metadata from AST nodes.

import {
  type ClassDeclaration,
  type ClassExpression,
  type ClassMethod,
  type FunctionExpression,
  type FunctionDeclaration,
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
  isRestElement,
  isObjectExpression,
  isTSAnyKeyword,
  isTSBooleanKeyword,
  isTSBigIntKeyword,
  isTSConstructorType,
  isTSExpressionWithTypeArguments,
  isTSFunctionType,
  isTSIntersectionType,
  isTSNeverKeyword,
  isTSNullKeyword,
  isTSNumberKeyword,
  isTSObjectKeyword,
  isTSParenthesizedType,
  isTSQualifiedName,
  isTSStringKeyword,
  isTSSymbolKeyword,
  isTSUndefinedKeyword,
  isTSVoidKeyword,
  isTSRestType,
  isTSThisType,
  isTSType,
  isTSTypeAnnotation,
  isTSTypeReference,
  isTSTupleType,
  isTSUnionType,
  isTypeAnnotation,
  isVoidTypeAnnotation,
} from "@babel/types";

import {
  createSimpleKeywordType,
  createSimpleDocumentedType,
  createComplexType,
  createFunctionType,
  createRestDataType,
  cloneType,
} from "@webdoc/model";
import type {DataType, Param, Return} from "@webdoc/types";

// Extracts all the extended class/interface names
export function extractExtends(
  node: ClassDeclaration | ClassExpression | InterfaceDeclaration | TSInterfaceDeclaration,
): ?(string[]) {
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
export function extractImplements(node: ClassDeclaration | ClassExpression): ?(string[]) {
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
): Param[] {
  if (!node.params && !node.parameters) {
    return [];
  }

  const nodeParams = node.params ? node.params : node.parameters;

  const params: Param[] = [];

  for (let i = 0; i < nodeParams.length; i++) {
    const paramNode = nodeParams[i];
    let notParsed = false;

    // TODO: Infer types
    if (isIdentifier(paramNode)) {
      params.push({
        identifier: paramNode.name,
        optional: paramNode.optional || false,
      });
    } else if (isRestElement(paramNode)) {
      params.push({
        identifier: paramNode.argument.name,
        optional: paramNode.optional || false,
        variadic: true,
      });
    } else if (isAssignmentPattern(paramNode)) {
      params.push({
        identifier: paramNode.left.name,
        optional: paramNode.optional || false,
        default: paramNode.right.raw,
      });
    } else if (isObjectExpression(paramNode)) {
      // TODO: Find a way to document {x, y, z} parameters
      // e.g. function ({x, y, z}), you would need to give the object pattern an anonymous like
      // "", " ", "  ",  "    " or using &zwnj; because it is truly invisible

      notParsed = true;
      ((params: any)).flawed = true;
      console.error("Object patterns as parameters can't be documented");
    } else {
      notParsed = true;
      ((params: any)).flawed = true;
      console.error("Parameter node couldn't be parsed");
    }

    if (!notParsed && paramNode.typeAnnotation) {
      params[params.length - 1].dataType = resolveDataType(paramNode.typeAnnotation);
    }
  }

  return params;
}

// Extract the returns for the method/function
export function extractReturns(
  node: ClassMethod | ObjectMethod | FunctionDeclaration | FunctionExpression,
): ?(Return[]) {
  if (node.returnType) {
    return [{dataType: resolveDataType(node.returnType)}];
  }
  if (node.typeAnnotation) {
    return [{dataType: resolveDataType(node.typeAnnotation)}];
  }

  return null;
}

// Resolve a type-annotation into a parsed DataType
function resolveDataType(type: TSTypeAnnotation | TSType): DataType {
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
      name = type.right + (name ? "." : "") + name;
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
    if (isTSVoidKeyword(type)) {
      return createSimpleKeywordType("void");
    }
    if (isTSThisType(type)) {
      return createSimpleDocumentedType("this");
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
  }

  if (isVoidTypeAnnotation(type)) {
    return createSimpleKeywordType("void");
  }

  console.log(type);
  console.log("***unknown data-type node***");

  // webdoc says ^sorry^
  return createSimpleKeywordType("unknown");
}
