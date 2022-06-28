// @flow

import * as fs from "fs";
// $FlowFixMe
import * as fsp from "fs/promises";
import * as https from "https";
import * as path from "path";
import * as tar from "tar-stream";
import {log, tag} from "missionlog";
import gunzip from "gunzip-maybe";
import {pipeline} from "stream";
import pkgUp from "pkg-up";
import {version} from "../package.json";

/**
 * Install a proprietary package from webdoc's server.
 */
export async function install({
  api = "https://webdoc-rest.herokuapp.com",
  pkg,
  eula,
}: {
  api?: string,
  pkg: string,
  eula: string
}) {
  if (eula !== "noncommercial" && eula !== "commercial" && eula !== "free-trial") {
    log.warn(tag.CLI, `EULA ${eula} not recognized`);
  }

  const mainFile = require.resolve(pkg);
  const manifestFile = await pkgUp({cwd: path.dirname(mainFile)});
  const packageDirectory = path.dirname(manifestFile);

  const [main, manifest] = await Promise.all([
    fsp.readFile(mainFile, "utf8"),
    fsp.readFile(manifestFile, "utf8").then((str) => JSON.parse(str)),
  ]);

  if (!manifest.webdocConfig || main.split("\n")[0] !== manifest.webdocConfig.stubHeader) {
    log.info(tag.CLI, `${pkg} already installed!`);
    return;
  }

  log.info(`Downloading ${pkg}`);

  const extract = tar.extract();

  https.request(`${api}/${pkg}/versions/${version}`, {
    method: "GET",
    headers: {
      "X-EULA": eula,
    },
  }, function(response: https.IncomingMessage) {
    if (response.statusCode !== 200) {
      log.error(tag.CLI, `Download for ${pkg} failed! Status code ${response.statusCode}`);
      return;
    }

    pipeline(
      response,
      gunzip(),
      extract,
      (e) => {
        if (e) log.error(tag.CLI, e);
      },
    );
    response.on("error", function(e) {
      log.error(tag.CLI, e);
    });
    response.on("end", function() {
      log.info(tag.CLI, "Download finished");
    });
  }).end();

  const writes: Promise<void>[] = [];

  await new Promise((resolve, reject) => {
    extract.on("entry", async function(header, stream, next) {
      console.log(header);

      stream.on("end", () => {
        next();
      });

      const file = path.join(packageDirectory, header.name.split("/").slice(1).join("/"));
      const dir = path.dirname(file);

      try {
        await fsp.access(dir);
      } catch {
        await fsp.mkdir(dir, {recursive: true});
      }

      log.info(tag.CLI, "Writing " + file);

      const fileStream = fs.createWriteStream(file);

      writes.push(new Promise((resolve, reject) => {
        fileStream.on("error", (e) => {
          log.error(tag.CLI, e);
          reject(e);
        });
        fileStream.on("end", () => {
          resolve();
        });
      }));

      stream.pipe(fileStream);
    });

    extract.on("finish", () => {
      resolve();
    });
    extract.on("error", (e) => {
      reject(e);
    });
  });
  await Promise.all(writes);

  delete require.cache[require.resolve(pkg)];
  delete require.cache[pkg];

  for (const privateDependency of manifest.webdocConfig.privateDependencies) {
    await install(privateDependency);
  }
}
