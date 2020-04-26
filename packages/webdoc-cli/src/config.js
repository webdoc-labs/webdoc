// @flow
import fs from "fs";
import {log, tags} from "missionlog";

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
    template: "@webdoc/legacy-template",
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
    config = Object.assign(defaultConfig, JSON.parse(fs.readFileSync(file, "utf8")));
  }

  return config;
}
