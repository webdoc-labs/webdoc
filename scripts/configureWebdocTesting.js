// This file configures @webdoc/* packages for unit-testing purposes.

const {applyDefaultLangConfig} = require("../packages/webdoc-parser/lib/parse.js");
const {initLogger: initParserLogger} = require("../packages/webdoc-parser/lib/Logger");

// Don't need to write a documentation comment above each symbol in unit-tests now
applyDefaultLangConfig({
  reportUndocumented: true,
});

// No INFO, please :-)
initParserLogger("WARN");
