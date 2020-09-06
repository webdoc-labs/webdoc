// @flow

import type {PackageDoc, SourceFile} from "@webdoc/types";
import path from "path";
import pkgUp from "pkg-up";

export function packages(sourceFiles: SourceFile[]): PackageDoc[] {
  const cache = new Map<string, PackageDoc>();
  const packages: PackageDoc[] = [];

  sourceFiles.forEach((file) => {
    const dir = path.dirname(file.path);

    // Attempt to get PackageDoc from directory mapping
    let pkg = cache.get(dir);

    if (!pkg) {
      const pkgJson = pkgUp.sync({cwd: dir});

      // Attempt to get PackageDoc from package.json mapping
      pkg = cache.get(pkgJson);

      if (!pkg) {
        // Create PackageDoc for this package
        pkg = {
          api: [],
          location: pkgJson,
          metadata: require(path.relative(__dirname, pkgJson)),
          type: "PackageDoc",
        };

        packages.push(pkg);
        cache.set(pkgJson, pkg);
      }

      cache.set(dir, pkg);
    }

    file.package = pkg;
  });

  return packages;
}
