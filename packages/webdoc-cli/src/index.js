// @flow

import * as path from "path";
import * as yargs from "yargs";
import {install} from "./installer";

async function start(argv: yargs.Argv): Promise<void> {
  let eula = argv.eula;

  if (!eula) {
    const {default: inquirer} = await import("inquirer");
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "eula",
        message: "Which EULA are you using webdoc with? " +
          "(pass it in --eula to skip question). " +
          "Choose a license from http://www.webdoclabs.com/pricing/ :",
        choices: [
          {
            name: "noncommercial " +
              "(free for nonprofit open source only) " +
              "http://www.webdoclabs.com/legal/license/license-noncommercial/",
            value: "noncommercial",
          },
          {
            name: "commercial    " +
              "(subscription required)               " +
              "http://www.webdoclabs.com/legal/license/license-commercial/",
            value: "commercial",
          },
        ],
      },
    ]);

    eula = answer.eula;
  }

  await install({
    api: argv.api,
    pkg: "@webdoc/language-parser",
    eula,
  });

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
