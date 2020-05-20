// @flow
import type {Doc} from "@webdoc/types";

export function isConstructor(doc: Doc): boolean {
  return doc.name === "constructor" && doc.type === "MethodDoc";
}

export function isClass(doc: Doc): boolean {
  return doc.type === "ClassDoc";
}

export function isEvent(doc: Doc): boolean {
  return doc.type === "EventDoc";
}

// JSDoc legacy - come back & reconsider this
export function isExternal(doc: Doc): boolean {
  return doc.type === "ExternalDoc";
}

export function isFunction(doc: Doc): boolean {
  return doc.type === "FunctionDoc";
}

export function isInterface(doc: Doc): boolean {
  return doc.type === "InterfaceDoc";
}

export function isMethod(doc: Doc): boolean {
  return doc.type === "MethodDoc";
}

// JSDoc legacy - come back & reconsider this
export function isModule(doc: Doc): boolean {
  return doc.type === "ModuleDoc";
}

export function isMixin(doc: Doc): boolean {
  return doc.type === "MixinDoc";
}

export function isNamespace(doc: Doc): boolean {
  return doc.type === "NSDoc";
}

export function isObject(doc: Doc): boolean {
  return doc.type === "ObjectDoc";
}

export function isProperty(doc: Doc): boolean {
  return doc.type === "PropertyDoc";
}

export function isTypedef(doc: Doc): boolean {
  return doc.type === "TypedefDoc";
}
