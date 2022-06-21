// @flow

import * as path from "path";
import * as yargs from "yargs";
import {install} from "./installer";

async function start(args: yargs.Argv): Promise<void> {
  let eula = args.eula;

  if (!args.eula) {
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
    api: args.api,
    pkg: "@webdoc/language-parser",
    eula,
  });

  // require after package install
  const {main} = require("./main");

  return (main: (args: yargs.Argv) => Promise<void>)(args);
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
