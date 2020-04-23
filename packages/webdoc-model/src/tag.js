// @flow

export type BaseTag = {
  name: string,
  value: string,
  type: "link" | "param" | "return" | "throws"
};

export type Tag = BaseTag | DeprecatedTag | TypedTag | ParamTag | ReturnTag | ThrowsTag
    | PrivateTag | ProtectedTag | PublicTag | VisibilityTag

export type DeprecatedTag = {
  ...BaseTag,
  type: "DeprecatedTag"
};

export type TypedTag = {
  ...BaseTag,
  dataType: string,
  description: string,
  type: "TypedTag",
};

export type ParamTag = {
  ...TypedTag,
  type: "ParamTag"
};

export type ReturnTag = {
  ...TypedTag,
  type: "ReturnTag"
};

export type ThrowsTag = {
  ...TypedTag,
  type: "ThrowsTag"
};

export type PrivateTag = {
  ...BaseTag,
  type: "PrivateTag"
};

export type ProtectedTag = {
  ...BaseTag,
  type: "ProtectedTag"
};

export type PublicTag = {
  ...BaseTag,
  type: "PublicTag"
};

export type VisibilityTag = {
  ...BaseTag,
  visiblity: "public" | "protected" | "private",
  type: "VisibilityTag"
};

