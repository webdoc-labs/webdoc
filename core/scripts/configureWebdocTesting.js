// This file configures @webdoc/* packages for unit-testing purposes.

const path = require("path");
const dir = process.env.PARSER_DIR
  ? path.relative(__dirname, path.join(process.env.PARSER_DIR, 'src'))
  : '../packages/webdoc-parser/lib';
const {applyDefaultLangConfig} = require(path.join(dir, "./parse"));
const {initLogger: initParserLogger} = require(path.join(dir, "./Logger"));

global.__TEST__ = true;

// Don't need to write a documentation comment above each symbol in unit-tests now
applyDefaultLangConfig({
  reportUndocumented: true,
});

// No INFO, please :-)
initParserLogger("WARN");
