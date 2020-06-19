export type ExplorerTargetData = {
  simpleName: string,
  canonicalName: string,
  expandByDefault?: boolean,
  pageUrl: string,
  children?: ?(ExplorerTargetData[])
};
