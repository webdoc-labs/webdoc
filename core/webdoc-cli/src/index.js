// @flow

import * as path from "path";
import * as yargs from "yargs";

async function start(argv: yargs.Argv): Promise<void> {
  // require after package install
  const {main} = require("./main");

  return (main: (args: yargs.Argv) => Promise<void>)(argv);
}

async function init(args: yargs.Argv): Promise<void> {
  const {init: _init} = await import("./commands/init.js");
  await _init(args);
}

yargs.scriptName("webdoc")
  .usage("$0 <cmd> -c <configFile> -u <tutorialDir> --verbose " +
    "--site-root <siteRoot> " +
    "--site-domain <siteDomain>" +
    "--no-workers")
  .command(
    "$0",
    "Run webdoc and generate documentation",
    function(_) {
      return _
        .default("workers", true)
        .default("config", path.join(process.cwd(), "webdoc.conf.json"), "webdoc config file")
        .alias("c", "config")
        .alias("u", "tutorials")
        .alias("v", "verbose")
        .alias("q", "quiet");
    },
    start)
  .command(
    "init",
    "Setup webdoc and create configuration files",
    {},
    init)
  .argv;
