const MarkdownIt = require("markdown-it");
const env = global.Webdoc.env;

const config = env["plugin/markdown"] || {};
const defaultTags = [
  "description",
  "brief",
];

let tags = [];
let excludeTags = [];

function shouldProcessString(tagName, text) {
  let shouldProcess = true;

  // we only want to process `@author` and `@see` tags that contain Markdown links
  if ( (tagName === "author" || tagName === "see") && !text.includes("[") ) {
    shouldProcess = false;
  }

  return shouldProcess;
}

const renderer = new MarkdownIt({
  breaks: !!config.hardwrap,
  html: true,
});

// Process the markdown source in a doc. The properties that should be processed are
// configurable, but always include "author", "classdesc", "description", "exceptions", "params",
// "properties",  "returns", and "see".  Handled properties can be bare strings, objects, or arrays
// of objects.
function process(doclet) {
  tags.forEach((tag) => {
    if (!doclet[tag]) {
      return;
    }

    if (typeof doclet[tag] === "string" && shouldProcessString(tag, doclet[tag]) ) {
      doclet[tag] = renderer.render(doclet[tag])
        .replace(/\s+$/, "")
        .replace(/&#39;/g, "'");
    } else if ( Array.isArray(doclet[tag]) ) {
      doclet[tag].forEach((value, index, original) => {
        const inner = {};

        inner[tag] = value;
        process(inner);
        original[index] = inner[tag];
      });
    }
  });
}

// set up the list of "tags" (properties) to process
if (config.tags) {
  tags = config.tags.slice();
}
// set up the list of default tags to exclude from processing
if (config.excludeTags) {
  excludeTags = config.excludeTags.slice();
}
defaultTags.forEach((tag) => {
  if (!excludeTags.includes(tag) && !tags.includes(tag)) {
    tags.push(tag);
  }
});

function convertMarkdownToHTML(doc /*: Doc */) {
  process(doc);

  for (let i = 0; i < doc.members.length; i++) {
    convertMarkdownToHTML(doc.members[i]);
  }
}

function main() {
  global.Webdoc.Parser.installPlugin({
    id: "@webdoc/plugin-markdown",
    onLoad() {
      // STAGE_FINISHED
      global.Webdoc.Parser.installDoctreeMod(
        "@webdoc/plugins-markdown",
        400,
        convertMarkdownToHTML);
    },
  });
}

main();
