export type BaseDoc = {
  name: string,
  path: string,
  stack: string[],
  parent: Doc,
  children: Doc[],
  tags: Tag[],
  brief: string,
  description: string,
  access: "public" | "protected" | "private",
  scope: "static" | "instance" | "inner",
  version: "alpha" | "beta" | "internal" | "public" | "deprecated",
  type: "ClassDoc" | "FunctionDoc" | "MethodDoc" | "ObjectDoc" | "RootDoc" | "TypedefDoc"
};

export type Doc = BaseDoc | ClassDoc | ObjectDoc | FunctionDoc | MethodDoc | PropertyDoc
  | TypedefDoc;

export type RootDoc = BaseDoc | {
  type: "RootDoc"
};

export type ClassDoc = BaseDoc | {
  type: "ClassDoc"
};

export type FunctionDoc = BaseDoc | {
  type: "FunctionDoc"
};

export type MethodDoc = BaseDoc | {
  type: "MethodDoc"
};

export type ObjectDoc = BaseDoc | {
  type: "ObjectDoc"
};

export type PropertyDoc = BaseDoc | {
  type: "PropertyDoc"
};

export type TypedefDoc = BaseDoc | {
  org: Doc,
  alias: string,
  type: "Typedefdoc",
};

export type BaseTag = {
  name: string,
  value: string,
  type: "link" | "param" | "return" | "throws"
};

export type Tag = BaseTag | AccessTag | DeprecatedTag | ExampleTag 
  | TypedTag | ParamTag | ReturnTag | ThrowsTag
  | PrivateTag | ProtectedTag | PublicTag  | TypedefTag

export type AccessTag = BaseTag | {
  access: "public" | "protected" | "private",
  type: "AccessTag"
};

export type DeprecatedTag = BaseTag | {
  type: "DeprecatedTag"
};

export type ExampleTag = BaseTag | {
  code: string,
  type: "ExampleTag"
};

export type InnerTag = BaseTag | {
  type: "InnerTag"
};

export type InstanceTag = BaseTag | {
  type: "InstanceTag"
};

export type TypedTag = BaseTag | {
  dataType: string,
  description: string,
  type: "TypedTag",
};

export type TypedefTag = BaseTag | {
  of: [string],
  alias: string,
  type: "TypedefTag"
};

export type ParamTag = TypedTag | {
  type: "ParamTag"
};

export type ReturnTag = TypedTag | {
  type: "ReturnTag"
};

export type ScopeTag = BaseTag | {
  scope: "static" | "instance" | "inner",
  type: "ScopeTag"
};

export type StaticTag = BaseTag | {
  type: "StaticTag"
};

export type ThrowsTag = TypedTag | {
  type: "ThrowsTag"
};

export type PrivateTag = BaseTag | {
  type: "PrivateTag"
};

export type ProtectedTag = BaseTag | {
  type: "ProtectedTag"
};

export type PublicTag = BaseTag | {
  type: "PublicTag"
};