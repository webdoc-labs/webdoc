// @flow

import * as Indexer from "./indexer";
import type {LanguageIntegration} from "@webdoc/language-library";
import {parse} from "./parse";
import registerWebdocParser from "./parser-plugin";

export {parse};
export {registerWebdocParser};
export {initLogger} from "./Logger";

export function installLanguage(lang: LanguageIntegration): void {
  Indexer.register(lang);
}
