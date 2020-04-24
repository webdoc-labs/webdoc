// @flow

export type SanitizedDoc = {
  name: string,
  type?: string,
  children: SanitizedDoc[],
  url?: string
};
