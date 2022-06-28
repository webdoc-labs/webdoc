// @flow

import * as Sentry from "@sentry/node";
import * as external from "@webdoc/externalize";
import * as yargs from "yargs";
import {LogLevel, log, tag} from "missionlog";
import {createRootDoc, exportTaffy} from "@webdoc/model";
import {installLanguage, parse, registerWebdocParser} from "@webdoc/language-parser";
import {RewriteFrames} from "@sentry/integrations";
import fs from "fs";
import fse from "fs-extra";
import {initLogger as initParserLogger} from "@webdoc/language-parser";
import {loadTutorials} from "./load-tutorials";
import path from "path";
// $FlowFixMe
import {performance} from "perf_hooks";
import {sources} from "./sources";

Sentry.init({
  dsn: "https://58a75d0c31524766b288a61751fd6690@o1292855.ingest.sentry.io/6514486",
  integrations: [new RewriteFrames()],
  tracesSampleRate: 1,
});

require("./shims");// Node v10 support

declare var global: Object;

export function initLogger(verbose: boolean = false, quiet: boolean = false) {
  const defaultLevel = verbose ? "INFO" : quiet ? "ERROR" : "WARN";

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

  initParserLogger(defaultLevel);
}

// main() is the default command.
export async function main(argv: yargs.Argv): Promise<void> {
  initLogger(!!argv.verbose, !!argv.quiet);

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

  for (const lang of config.languages) {
    // $FlowFixMe
    const {default: pkg} = await import(lang);

    installLanguage(pkg);
  }

  if (config.plugins) {
    for (const pluginPath of config.plugins) {
      if (pluginPath === "plugins/markdown") {
        require("@webdoc/plugin-markdown");
        continue;
      }

      // Plugin should invoke installPlugin to whatever APIs it uses.
      try {
        // $FlowFixMe
        require(pluginPath);
      } catch {
        try {
          // $FlowFixMe
          require(path.join(path.dirname(argv.config), pluginPath));
        } catch {
          log.error(tag.CLI, `Failed to resolve plugin: ${pluginPath}`);
        }
      }
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
    source: sourceFiles,
    verbose: !!argv.verbose,
    cmdLine: {
      mainThread: argv.mainThread,
    },
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
