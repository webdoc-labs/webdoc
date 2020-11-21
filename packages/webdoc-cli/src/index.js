// @flow

import * as yargs from "yargs";
import {LogLevel, log, tag} from "missionlog";
import {createRootDoc, exportTaffy} from "@webdoc/model";
import {parse, registerWebdocParser} from "@webdoc/parser";
import fs from "fs";
import fse from "fs-extra";
import {initLogger as initParserLogger} from "@webdoc/parser";
import {loadTutorials} from "./load-tutorials";
import path from "path";
import {sources} from "./sources";
import {writeDoctree} from "@webdoc/externalize";

require("./shims");// Node v10 support

declare var global: Object;

export function initLogger(verbose: boolean = false) {
  const defaultLevel = verbose ? "INFO" : "WARN";

  log.init(
    {
      Parser: defaultLevel,
      Config: defaultLevel,
      CLI: defaultLevel,
    },
    (level, tag, msg, params) => {
      tag = `[${tag}]:`;
      switch (level) {
      case LogLevel.ERROR:
        console.error(tag, msg, ...params);
        break;
      case LogLevel.WARN:
        console.warn(tag, msg, ...params);
        break;
      case LogLevel.INFO:
        console.info(tag, msg, ...params);
        break;
      default:
        console.log(tag, msg, ...params);
        break;
      }
    });
}

// main() is the default command.
async function main(argv: yargs.Argv) {
  initLogger(!!argv.verbose);

  if (argv.verbose) {
    initParserLogger("INFO");
  }

  const start = performance.now();

  global.Webdoc = global.Webdoc || {};
  registerWebdocParser();// global.Webdoc.Parser

  const {loadConfig, getIncludePattern, getTemplate} = require("./config");
  const config = loadConfig(argv.config);
  const tutorials = loadTutorials(argv.tutorials);

  // TODO: Fix what env/conf is?
  global.Webdoc.env = config;
  // $FlowFixMe
  global.Webdoc.env.conf = config;
  global.Webdoc.userConfig = config;

  // TODO: excludePattern
  const includePattern = getIncludePattern(config);

  if (!includePattern) {
    console.log("No source.include or source.includePattern found in config file");
  }

  if (config.plugins) {
    for (const pluginPath of config.plugins) {
      if (pluginPath === "plugins/markdown") {
        require("@webdoc/plugin-markdown");
        continue;
      }

      // Plugin should invoke installPlugin to whatever APIs it uses.
      // $FlowFixMe
      require(pluginPath);
    }
  }

  const documentTree = createRootDoc();
  const sourceFiles = sources(config, documentTree);

  documentTree.children = documentTree.members;

  if (config.opts && config.opts.export) {
    fse.ensureFileSync(config.opts.export);
  }

  try {
    parse(sourceFiles, documentTree);
  } catch (e) {
    // Make sure we get that API structure out so the user can debug the problem!
    if (config.opts && config.opts.export) {
      fs.writeFileSync(config.opts.export, writeDoctree(documentTree));
    }

    throw e;
  }

  log.info(tag.Parser, "Parsing stage finished!");

  if (config.opts && config.opts.export) {
    fs.writeFileSync(config.opts.export, writeDoctree(documentTree));
  }

  const db = exportTaffy(documentTree);

  const _path = `${getTemplate(config)}/publish`;
  // $FlowFixMe
  const template = require(_path);

  log.info(tag.CLI, "Executing template");

  const publishOptions = {
    config,
    doctree: documentTree,
    documentTree,
    docDatabase: db,
    opts: config.opts,
    tutorials,
    verbose: !!argv.verbose,
  };

  if (template.publish && typeof template.publish === "function") {
    template.publish(publishOptions);
  } else {
    console.error("[Config]: ", `${getTemplate(config)} not found.`);
  }

  console.log(`@webdoc took ${Math.ceil(performance.now() - start)}ms to run!`);
}

const argv = yargs.scriptName("@webdoc/cli")
  .usage("$0 -c <configFile> -u <tutorialDir> --verbose")
  .default("config", path.join(process.cwd(), "webdoc.conf.json"), "webdoc config file")
  .alias("c", "config")
  .alias("u", "tutorials")
  .alias("v", "verbose")
  .command("$0", "Run webdoc", () => {})
  .argv;

main(argv).catch((e) => {
  throw e;
});
