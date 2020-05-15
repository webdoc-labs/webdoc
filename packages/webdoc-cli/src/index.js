// @flow
import path from "path";
import * as yargs from "yargs";
import {log, tag, LogLevel} from "missionlog";
import globby from "globby";
import type {RootDoc} from "@webdoc/types";
import {parse} from "@webdoc/parser";
import {exportTaffy} from "@webdoc/model";
import {writeDoctree} from "@webdoc/externalize";
import fs from "fs";

export function initLogger(verbose: boolean = false) {
  const defaultLevel = verbose ? "INFO" : "WARN";

  log.init(
    {
      Parser: defaultLevel,
      Config: defaultLevel,
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
async function main(argv: yargs.Arguments<>) {
  if (argv.verbose) {
    initLogger(true);
  } else {
    initLogger(true);
  }

  console.log("@webdoc/cli ------------------ ");

  const {loadConfig} = require("./config");
  const config = loadConfig(argv.config);

  // TODO: excludePattern
  const includePattern = config.source.includePattern || config.source.include;

  if (!includePattern) {
    console.log("No source.include or source.includePattern found in config file");
  }

  const sourceFiles = globby.sync(includePattern);

  const doctree: RootDoc = {
    children: [],
    path: "",
    stack: [""],
    type: "RootDoc",
    tags: [],
  };

  doctree.members = doctree.children;

  const files = new Array(sourceFiles.length);

  for (let i = 0; i < sourceFiles.length; i++) {
    log.info(tag.Parser, `Parsing ${sourceFiles[i]}`);
    files[i] = fs.readFileSync(path.join(process.cwd(), sourceFiles[i]), "utf8");
  }

  parse(files, doctree);
  console.log("Parsed all");

  if (config.opts.export) {
    fs.writeFileSync(config.opts.export, writeDoctree(doctree));
  }

  const db = exportTaffy(doctree);

  const _path = `${config.opts.template}/publish`;
  // $FlowFixMe
  const template = require(_path);
  console.log("__TEMPLTE");

  const publishOptions = {
    config,
    docDatabase: db,
    doctree,
    opts: config.opts,
    tutorials: [],
  };

  if (template.publish && typeof template.publish === "function") {
    template.publish(publishOptions);
  } else {
    console.error("[Config]: ", `${config.opts.template} not found.`);
  }
}

console.log("initializing ----------");

const argv = yargs.scriptName("@webdoc/cli")
  .usage("$0 -c webdoc.conf.json")
  .default("config", path.join(process.cwd(), "webdoc.conf.json"), "webdoc config file")
  .alias("c", "config")
  .command("$0", "Run webdoc", () => {})
  .argv;

main(argv);
