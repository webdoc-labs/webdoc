// @flow

import type {PackageDoc, SourceFile} from "@webdoc/types";
import path from "path";
import pkgUp from "pkg-up";

let pkgId = 0;

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
        const metadata = require(path.relative(__dirname, pkgJson));

        // Create PackageDoc for this package
        pkg = {
          id: `package-${pkgId++}`,
          api: [],
          name: metadata.name,
          path: metadata.name,
          location: path.dirname(pkgJson),
          metadata,
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
