// @flow

// $FlowFixMe
import * as fs from "fs/promises";
import * as path from "path";

const stub = ({ WD_DEPS }) =>
`/* © 2020-2022 webdoc Labs */

module.exports.WD_INSTALLED = false;
module.exports.WD_DEPS = ${JSON.stringify(WD_DEPS)};`

export async function publishStub({ packageDirectory = process.cwd() }: { packageDirectory: string }) {
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
      access: "public"
    },
    homepage: "https://www.webdoclabs.com",
    main,
    files: [
      main,
    ]
  };
  const {projects} = JSON.parse(await fs.readFile(path.join(__dirname, "../../../rush.json")));
  const stubDirectory = path.join(__dirname, "../.stub", name);
  const scriptDirectory = path.dirname(path.join(stubDirectory, main));

  try {
    await fs.access(scriptDirectory);
  } catch {
    await fs.mkdir(scriptDirectory, { recursive: true });
  }

  await fs.writeFile(
    path.join(stubDirectory, "package.json"),
    JSON.stringify(stubManifest, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(stubDirectory, main),
    stub({
      WD_DEPS: []
        .concat(Object.keys(dependencies))
        .concat(Object.keys(peerDependencies))
        .filter((pkg) => pkg.startsWith('@webdoc') &&
          projects.find((project) => project.packageName === pkg
            && project.reviewCategory === "proprietary"))
    })
  );
}