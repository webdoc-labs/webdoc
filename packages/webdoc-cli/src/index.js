// @flow

import * as external from "@webdoc/externalize";
import * as yargs from "yargs";
import {LogLevel, log, tag} from "missionlog";
import {createRootDoc, exportTaffy} from "@webdoc/model";
import {parse, registerWebdocParser} from "@webdoc/parser";
import fs from "fs";
import fse from "fs-extra";
import {initLogger as initParserLogger} from "@webdoc/parser";
import {loadTutorials} from "./load-tutorials";
import path from "path";
// $FlowFixMe
import {performance} from "perf_hooks";
import {sources} from "./sources";

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

  const {loadConfig, getTemplate} = require("./config");
  const config = loadConfig(argv.config);
  const tutorials = loadTutorials(argv.tutorials, config.template.routes.tutorials);

  if (argv.siteRoot) {
    config.template.siteRoot = argv.siteRoot;
  }
  if (argv.siteDomain) {
    config.template.siteDomain = argv.siteDomain;
  }
  if (config.template.siteRoot[0] === "/") {
    config.template.siteRoot = config.template.siteRoot.slice(1);
  }
  if (config.template.siteRoot.endsWith("/")) {
    config.template.siteRoot = config.template.siteRoot.slice(0, -1);
  }

  // TODO: Fix what env/conf is?
  global.Webdoc.env = config;
  // $FlowFixMe
  global.Webdoc.env.conf = config;
  global.Webdoc.userConfig = config;

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
  documentTree.tutorials.push(...tutorials);

  if (config.opts && config.opts.export) {
    fse.ensureFileSync(config.opts.export);
  }

  try {
    await parse(sourceFiles, documentTree, {
      mainThread: !argv.workers,
    });
  } catch (e) {
    // Make sure we get that API structure out so the user can debug the problem!
    if (config.opts && config.opts.export) {
      fs.writeFileSync(config.opts.export, external.write(external.fromTree(documentTree), true));
    }

    throw e;
  }

  log.info(tag.Parser, "Parsing stage finished!");

  const manifest = external.fromTree(documentTree);
  const db = exportTaffy(documentTree);

  manifest.metadata.linker = "(unsigned)";
  manifest.metadata.siteDomain = config.template.siteDomain;
  manifest.metadata.siteRoot = config.template.siteRoot;

  const _path = `${getTemplate(config)}/publish`;
  // $FlowFixMe[unsupported-syntax]
  const template = require(_path);

  log.info(tag.CLI, "Executing template");

  const publishOptions = {
    config,
    doctree: documentTree,
    documentTree,
    manifest,
    docDatabase: db,
    opts: config.opts,
    tutorials,
    verbose: !!argv.verbose,
  };

  if (template.publish && typeof template.publish === "function") {
    const resolve = template.publish(publishOptions);

    if (resolve) {
      await resolve;
    }
  } else {
    console.error("[Config]: ", `${getTemplate(config)} not found.`);
  }

  if (config.opts && config.opts.export) {
    fs.writeFileSync(config.opts.export, external.write(manifest, argv.verbose));
  }

  console.log(`@webdoc took ${Math.ceil(performance.now() - start)}ms to run!`);
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
  .command("$0", "Run webdoc", () => {})
  .argv;

main(argv).catch((e) => {
  throw e;
});
