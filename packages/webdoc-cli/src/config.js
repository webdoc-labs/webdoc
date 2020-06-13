// @flow
import fs from "fs";
import {log, tags} from "missionlog";
import merge from "lodash/merge";

/* eslint-disable no-multi-spaces */
const defaultConfig = {
  docs: {
    sort: "type, scope, access, name",                    // @webdoc/parser{mod:sort}
  },
  source: {
    includePattern: "./**/*.js",                          // @webdoc/cli{main}
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
    default: {
      includeDate: true,
    },
    repository: undefined, // ex. GitHub repo holding source files to link source files
    // should contain branch - https://github.com/webdoc-js/webdoc/blob/master/
  },
  version: {
    number: 1,
  },
};
/* eslint-enable no-multi-spaces */

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
