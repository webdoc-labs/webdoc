// @flow
import fs from "fs";
import {log, tags} from "missionlog";
import merge from "lodash/merge";

const defaultConfig = {
  source: {
    includePattern: "./**/*.js",
  },
  conf: {
    tags: {
      dictionaries: [],
    },
    templates: {
      default: {
        useLongNameInNav: true,
      },
    },
  },
  opts: {
    destination: "docs",
    export: "example.api.json",
    template: "@webdoc/legacy-template",
  },
  template: {
    mainPage: {
      title: "Main Page",
    },
  },
  version: {
    number: 1,
  },
};

export function loadConfig(file: string) {
  let config;

  if (!fs.existsSync(file)) {
    log.warn(tags.Config, `Configuration file not found at: ${file}`);
    config = defaultConfig;
  } else {
    const userConfig = JSON.parse(fs.readFileSync(file, "utf8"));
    config = merge(defaultConfig, userConfig);
  }

  return config;
}
