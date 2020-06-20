export type ExplorerTargetData = {
  title: string,
  page: string,
  children?: { [id: string]: ExplorerTargetData | ExplorerTargetData[] }
};
