// @flow
import {log, tags} from "missionlog";
import fs from "fs";
import merge from "lodash.merge";

type ConfigSchema = {
  plugins?: Array<string>,
  docs?: {
    sort?: string
  },
  source?: {
    includePattern?: string | Array<string>,
    include?: string | Array<string>
  },
  conf?: {
    tags?: {
      dictionaries: Array<string>
    },
    templates?: {
      default?: {
        useLongNameInNav?: boolean
      }
    },
  },
  opts?: {
    destination?: string,
    export?: string,
    template?: string,
  },
  template: {
    siteRoot: string,
    mainPage?: {
      title?: string
    },
    default: {
      includeData?: true
    },
    apiExplorer?: {
      mode?: string
    },
    repository?: string,
    outputSourceFiles?: boolean
  },
  version: {
    number?: 1
  }
};

/* eslint-disable no-multi-spaces */
const defaultConfig: ConfigSchema = {
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
    template: "@webdoc/default-template",
  },
  template: {
    siteRoot: "",
    mainPage: {
      title: "Main Page",
    },
    default: {
      includeDate: true,
    },
    apiExplorer: {
      mode: "package",
    },
    repository: undefined, // ex. GitHub repo holding source files to link source files
    // should contain branch - https://github.com/webdoc-js/webdoc/blob/master/
  },
  version: {
    number: 1,
  },
};
/* eslint-enable no-multi-spaces */

export function loadConfig(file: string): ConfigSchema {
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

export function getIncludePattern(config: ConfigSchema): string[] {
  const source = config.source;

  if (typeof source !== "undefined") {
    if (typeof source.includePattern !== "undefined") {
      if (Array.isArray(source.includePattern)) {
        return source.includePattern;
      } else if (typeof source.includePattern === "string") {
        return [source.includePattern];
      }
    }

    if (typeof source.include !== "undefined") {
      if (Array.isArray(source.include)) {
        return source.include;
      } else if (typeof source.include === "string") {
        return [source.include];
      }
    }
  }

  return [];
}

export function getTemplate(config: ConfigSchema): string {
  if (config.opts && config.opts.template) {
    return config.opts.template;
  }

  return "@webdoc/default-template";
}
