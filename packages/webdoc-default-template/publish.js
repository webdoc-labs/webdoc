// @flow

const {crawl} = require("./helper/crawl");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const {
  FlushToFile,
  SymbolLinks,
  TemplateRenderer,
  TemplatePipeline,
  TemplateTagsResolver,
} = require("@webdoc/template-library");

/*::
import type {
  RootDoc
} from "@webdoc/model";

*/

// Static files in the "code-prettify" package that are used by the generated site
const PRETTIFIER_SCRIPT_FILES = [
  "lang-css.js",
  "prettify.js",
];

exports.publish = (options /*: PublishOptions */) => {
  const docTree = options.documentTree;
  const outDir = path.normalize(options.config.opts.destination);
  const index = SymbolLinks.getFileName("index");

  const crawlData = crawl(docTree);
  const renderer = new TemplateRenderer(path.join(__dirname, "tmpl"), null, docTree)
    .setLayoutTemplate("layout.tmpl");
  const pipeline = new TemplatePipeline(renderer)
    .pipe(new TemplateTagsResolver())
    .pipe(new FlushToFile({skipNullFile: false}));

  outStaticFiles(outDir);
  outExplorerData(outDir, crawlData);

  pipeline.render("base.tmpl", {docs: [docTree], title: "Test Template", env: options.config}, {
    outputFile: path.join(outDir, index),
  });
};

function outStaticFiles(outDir /*: string */) /*: Promise */ {
  const staticDir = path.join(__dirname, "./static");

  return fse.copy(staticDir, outDir)
    .then(() => {
      // Copy the prettify script to outDir
      PRETTIFIER_SCRIPT_FILES.forEach((fileName) => {
        const toPath = path.join(outDir, "scripts", path.basename(fileName));

        fs.copyFileSync(
          path.join(require.resolve("code-prettify"), "..", fileName),
          toPath,
        );
      });
    });
}

function outExplorerData(outDir /*: string */, crawlData /*: CrawlData */) {
  const explorerDir = path.join(outDir, "./explorer");

  fse.ensureDir(explorerDir).then(() => {
    fs.writeFile(
      path.join(explorerDir, "./reference.json"),
      JSON.stringify(crawlData.reference),
      "utf8",
      (err) => {
        if (err) throw err;
      });
  });
}
