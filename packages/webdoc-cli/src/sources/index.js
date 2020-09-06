import type {RootDoc, SourceFile} from "@webdoc/types";
import globby from "globby";
import {packages} from "./packages";

export function sources(config: Object, documentTree: RootDoc): SourceFile[] {
  const includePattern = config.source.includePattern || config.source.include;

  if (!includePattern) {
    console.log("No source.include or source.includePattern found in config file");
  }

  const paths = globby.sync(includePattern);
  const sources: SourceFile[] = paths.map((file) => ({path: file}));

  documentTree.packages = packages(sources);

  return sources;
}
