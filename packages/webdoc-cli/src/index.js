// @flow

import * as path from "path";
import * as yargs from "yargs";
import {install} from "./installer";

async function start(args: yargs.Argv): void {
  await install({
    api: args.api,
    pkg: "@webdoc/language-parser",
    eula: "commercial",
  });

  // require after package install
  const {main} = require("./main");

  return main(args);
}

const argv = yargs.scriptName("@webdoc/cli")
  .usage("$0 -c <configFile> -u <tutorialDir> --verbose " +
    "--site-root <siteRoot> " +
    "--site-domain <siteDomain>" +
    "--no-workers")
  .default("workers", true)
  .default("config", path.join(process.cwd(), "webdoc.conf.json"), "webdoc config file")
  .alias("c", "config")
  .alias("u", "tutorials")
  .alias("v", "verbose")
  .alias("q", "quiet")
  .command("$0", "Run webdoc", () => {})
  .argv;

start(argv).catch((e) => {
  throw e;
});
