// @flow

import {log, tag} from "missionlog";
import fs from "fs";
import merge from "lodash.merge";

type ConfigSchema = {
  plugins: Array<string>,
  languages?: Array<string>,
  docs?: {
    sort?: string | string[]
  },
  source?: {
    // Declared in order of priority
    include?: string | Array<string>,
    includePattern?: string | Array<string>,
    excludePattern?: string | Array<string>,
    exclude?: string | Array<string>,
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
    import?: string[],
  },
  template: {
    assets: Array<string>,
    alias: {
      [string]: string;
    },
    appBar: {
      items: {
        [string]: {
          name: string,
          uri: string,
        }
      }
    },
    applicationName: string,
    routes: {
      tutorials: string,
    },
    sources: boolean,
    stylesheets: Array<string>,
    siteDomain?: string,
    siteRoot: string,
    title?: string,
    mainPage?: {
      title?: string
    },
    meta: any,
    default: {
      includeData?: true
    },
    apiExplorer?: {
      mode?: string
    },
    repository?: string,
    outputSourceFiles?: boolean,
    integrations: any,
    variant: string,
  },
  version: {
    number?: 1
  }
};

/* eslint-disable no-multi-spaces */
const defaultConfig: ConfigSchema = {
  languages: [
    "@webdoc/language-babel/Language-JavaScript.js",
    "@webdoc/language-babel/Language-TypeScript.js",
  ],
  docs: {
    sort: ["type", "scope", "access", "name"],                    // @webdoc/parser{mod:sort}
  },
  source: {
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
    assets: [],
    alias: {},
    appBar: {
      items: {},
    },
    applicationName: "{ <i>webdoc</i> }",
    routes: {
      tutorials: "tutorials",
    },
    siteRoot: "",
    sources: true,
    stylesheets: [],
    mainPage: {
      title: "Main Page",
    },
    meta: {},
    default: {
      includeDate: true,
    },
    apiExplorer: {
      mode: "package",
    },
    repository: undefined, // ex. GitHub repo holding source files to link source files
    // should contain branch - https://github.com/webdoc-js/webdoc/blob/master/
    integrations: {},
    variant: "normal",
  },
  version: {
    number: 1,
  },
};
/* eslint-enable no-multi-spaces */

export function loadConfig(file: string): ConfigSchema {
  let config;

  if (!fs.existsSync(file)) {
    log.warn(tag.Config, `Configuration file not found at: ${file}`);
    config = defaultConfig;
  } else {
    const userConfig = JSON.parse(fs.readFileSync(file, "utf8"));
    config = merge(defaultConfig, userConfig);
  }

  log.info(tag.CLI, "Loaded configuration");

  return config;
}

export function getTemplate(config: ConfigSchema): string {
  if (config.opts && config.opts.template) {
    return config.opts.template;
  }

  return "@webdoc/default-template";
}
