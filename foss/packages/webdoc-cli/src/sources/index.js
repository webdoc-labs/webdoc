import type {RootDoc, SourceFile} from "@webdoc/types";
import globby from "globby";
import {packages} from "./packages";

// Create a filtering callback that returns whether a path passes all
// patterns (if exclude = false) or if it fails all of them (if exclude = true).
function makePatternFilter(
  patterns: string | string[],
  exclude: boolean = false,
): (path: string) => boolean {
  const normalizedFormat = Array.isArray(patterns) ?
    patterns :
    ((patterns && [patterns]) || []);

  if (normalizedFormat.length === 0) {
    // If no patterns to match, then short circuit evaluation.
    return () => true;
  }

  const regExps = normalizedFormat.map(
    (pattern) => {
      try {
        return new RegExp(pattern, "g");
      } catch (e) {
        console.error("Invalid pattern: " + pattern +
          "\nPlease make sure the patterns in sources.includePattern or source.excludePattern " +
          "defined in your configuration file are valid\n",
        );
      }
    },
  );

  return function(path: string): boolean {
    for (const regExp of regExps) {
      if (path.match(regExp)) {
        // If include pattern matched, return true.
        // If exclude pattern matched, return false.
        return !exclude;
      }
    }

    // If all include patterns failed, return false.
    // If all exclude patterns passed, return true.
    return exclude;
  };
}

export function sources(config: Object, documentTree: RootDoc): SourceFile[] {
  const {
    include,
    includePattern,
    exclude,
    excludePattern,
  } = config.source;

  if (!include) {
    console.error("No input files specified. You must " +
      "define source.include in your configuration file.");

    return [];
  }

  const paths = globby.sync(include);
  const excludePaths = Array.isArray(exclude) ?
    exclude :
    ((exclude && [exclude]) || []);

  const sources: SourceFile[] = paths
    .filter(makePatternFilter(includePattern, false))
    .filter(makePatternFilter(excludePattern, true))
    .filter((path) => !(excludePaths.some(
      (excludedPath) => path === excludePaths,
    )))
    .map((path) => ({path}));

  documentTree.packages = packages(sources);

  return sources;
}
