// @flow
// This file configures @webdoc/* packages for unit-testing purposes.

import {langJS, langTS} from "@webdoc/language-babel";
import {applyDefaultLangConfig} from "./src/parse";
import {initLogger} from "@webdoc/language-library";
import {installLanguage} from "./src";

global.__TEST__ = true;

// Don't need to write a documentation comment above each symbol in unit-tests now
applyDefaultLangConfig({
  reportUndocumented: true,
});

// No INFO, please :-)
initLogger("WARN");

installLanguage(langJS);
installLanguage(langTS);
