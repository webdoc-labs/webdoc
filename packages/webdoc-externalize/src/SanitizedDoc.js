// @flow

export type SanitizedDoc = {
  name: string,
  type: string,
  members?: SanitizedDoc[],
  url?: string,
  access?: string,
  scope?: string,
  version?: string,
  brief?: string
};
