// @flow
// This file essentially exposes a @webdoc/parser API so that plugins & templates don't have a dependency on it.

import type {RootDoc} from "@webdoc/types";
import {registerDoctreeMod} from "./doctree-mods";

export type ParserPlugin = {
  id: string,
  onLoad: (parser: Parser) => void;
}

const installedPlugins: { [id: string]: ParserPlugin } = {};

export default function registerWebdocParser(): void {
  global.Webdoc = global.Webdoc || {};

  if (global.Webdoc.Parser) {
    throw new Error("Webdoc.Parser already exists." +
      "Make sure your template/plugin doesn't have a dependency on @webdoc/parser");
  }

  global.Webdoc.Parser = {
    installDoctreeMod: registerDoctreeMod,
    installPlugin(plugin: ParserPlugin) {
      if (installedPlugins[plugin.id]) {
        throw new Error(`Plugin ${plugin.id} is already installed.`);
      }

      installedPlugins[plugin.id] = plugin;

      plugin.onLoad(global.Webdoc.Parser);
    },
  };
}
