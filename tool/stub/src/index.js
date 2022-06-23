// @flow

import { exec } from "child_process";
// $FlowFixMe
import * as fs from "fs/promises";
import * as path from "path";

const WD_NOT_INSTALLED = "/* WD_NOT_INSTALLED */";

export async function publishStub({
  packageDirectory = process.cwd(),
}: {
  packageDirectory: string
}) {
  const packageManifestPath = path.join(packageDirectory, "./package.json");
  const {
    name,
    description,
    version,
    dependencies,
    peerDependencies,
    devDependencies,
    main = "lib/index.js",
  } = JSON.parse(
    await fs.readFile(packageManifestPath));
  const {projects} = JSON.parse(await fs.readFile(path.join(__dirname, "../../../rush.json")));

  const stubManifest = {
    name,
    description,
    version,
    author: "Shukant Pal <shukant@webdoclabs.com>",
    license: "ISC",
    dependencies,
    devDependencies,
    peerDependencies,
    publishConfig: {
      access: "public",
    },
    homepage: "https://www.webdoclabs.com",
    main,
    files: [
      main,
    ],
    webdocConfig: {
      privateDependencies: []
        .concat(Object.keys(dependencies))
        .concat(Object.keys(peerDependencies))
        .filter((pkg) => pkg.startsWith("@webdoc") &&
          projects.find((project) => project.packageName === pkg &&
            project.reviewCategory === "proprietary")),
      stubHeader: WD_NOT_INSTALLED,
    },
  };
  const stubDirectory = path.join(__dirname, "../.stub", name);
  const scriptDirectory = path.dirname(path.join(stubDirectory, main));

  try {
    await fs.access(scriptDirectory);
  } catch {
    await fs.mkdir(scriptDirectory, {recursive: true});
  }

  await fs.writeFile(
    path.join(stubDirectory, "package.json"),
    JSON.stringify(stubManifest, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(stubDirectory, main),
    WD_NOT_INSTALLED,
  );

  await new Promise((resolve, reject) => {
    const proc = exec("npm publish", {
      cwd: stubDirectory,
    }, (err) => {
      if (err) {
        reject(err);
      }
    });

    proc.stdout.on("data", console.log);
    proc.stderr.on("data", console.error);
  });
}
