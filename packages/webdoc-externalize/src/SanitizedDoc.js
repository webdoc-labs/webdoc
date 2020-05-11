// @flow

export type SanitizedDoc = {
  name: string,
  type?: string,
  children?: SanitizedDoc[],
  url?: string,
  access: string,
  scope: string,
  version: string,
  brief: string
};
