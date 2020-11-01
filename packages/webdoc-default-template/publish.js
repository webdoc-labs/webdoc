// @flow

const {crawl} = require("./helper/crawl");
const fse = require("fs-extra");
const path = require("path");
const {
  doc: findDoc,
  traverse,
} = require("@webdoc/model");
const {
  FlushToFile,
  TemplateRenderer,
  TemplatePipeline,
  TemplateTagsResolver,
} = require("@webdoc/template-library");
const {linker} = require("./helper/linker");

// Plugins
const {indexSorterPlugin} = require("./helper/renderer-plugins/index-sorter");
const {signaturePlugin} = require("./helper/renderer-plugins/signature");
const {categoryFilterPlugin} = require("./helper/renderer-plugins/category-filter");

/*::
import type {
  RootDoc
} from "@webdoc/model";

*/

Object.assign(linker.standaloneDocTypes, [
  "ClassDoc",
  "EnumDoc",
  "FunctionDoc",
  "InterfaceDoc",
  "MixinDoc",
  "NSDoc",
  "PackageDoc",
  "TutorialDoc",
  "TypedefDoc",
]);

// Static files in the "code-prettify" package that are used by the generated site
const PRETTIFIER_SCRIPT_FILES = [
  "lang-css.js",
  "prettify.js",
];

let idToDoc/*: Map<string, Doc> */;

exports.publish = (options /*: PublishOptions */) => {
  const docTree = options.documentTree;
  const outDir = path.normalize(options.config.opts.destination);
  const index = linker.createURI("index.html");

  fse.ensureDir(outDir);

  const crawlData = crawl(docTree);
  const renderer = new TemplateRenderer(path.join(__dirname, "tmpl"), null, docTree)
    .setLayoutTemplate("layout.tmpl")
    .installPlugin("linker", linker)
    .installPlugin("generateIndex", indexSorterPlugin)
    .installPlugin("signature", signaturePlugin)
    .installPlugin("categoryFilter", categoryFilterPlugin);
  const pipeline = new TemplatePipeline(renderer)
    .pipe(new TemplateTagsResolver())
    .pipe(new FlushToFile({skipNullFile: false}));

  idToDoc = new Map();

  traverse(docTree, (doc) => {
    if (doc.type === "RootDoc") {
      doc.packages.forEach((pkg) => {
        idToDoc.set(pkg.id, pkg);
      });
    }
    idToDoc.set(doc.id, doc);
  });

  outStaticFiles(outDir);
  outExplorerData(outDir, crawlData);
  outMainPage(path.join(outDir, index), pipeline, options.config);
  outIndexes(outDir, pipeline, options.config, crawlData.index);
  outReference(outDir, pipeline, options.config, docTree);
};

// Copy the contents of ./static to the output directory
function outStaticFiles(outDir /*: string */) /*: Promise */ {
  const staticDir = path.join(__dirname, "./static");

  return fse.copy(staticDir, outDir)
    .then(() => {
      // Copy the prettify script to outDir
      PRETTIFIER_SCRIPT_FILES.forEach((fileName) => {
        const toPath = path.join(outDir, "scripts", path.basename(fileName));

        fse.copyFileSync(
          path.join(require.resolve("code-prettify"), "..", fileName),
          toPath,
        );
      });
    });
}

// Write the explorer JSON data in the output directory
function outExplorerData(outDir /*: string */, crawlData /*: CrawlData */) {
  const explorerDir = path.join(outDir, "./explorer");

  fse.ensureDir(explorerDir).then(() => {
    fse.writeFile(
      path.join(explorerDir, "./reference.json"),
      JSON.stringify(crawlData.reference),
      "utf8",
      (err) => {
        if (err) throw err;
      });
  });
}

// Render the main-page into index.html (outputFile)
async function outMainPage(
  outputFile /*: string */,
  pipeline /*: TemplatePipeline */,
  config, /*: WebdocConfig */
) {
  if (config.template.readme) {
    const readmeFile = path.join(process.cwd(), config.template.readme);

    outReadme(
      outputFile,
      pipeline,
      config,
      readmeFile,
    );
  }
}

async function outReadme(
  outputFile /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  readmeFile, /*: string */
) {
  if (!(await fse.pathExists(readmeFile))) {
    return;
  }

  let readme;

  if (readmeFile.endsWith(".md")) {
    const markdownRenderer = require("markdown-it")({
      breaks: false,
      html: true,
    })
      .use(require("markdown-it-highlightjs"));
    const markdownSource = await fse.readFile(readmeFile, "utf8");

    readme = markdownRenderer.render(markdownSource);
  }

  pipeline.render("pages/main-page.tmpl", {
    docs: [],
    readme,
    title: "Test Template",
    env: config,
  }, {outputFile});
}

function outIndexes(
  outDir /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  index, /*: Index */
) {
  const KEY_TO_TITLE = {
    "classes": "Class Index",
  };

  function outIndex(indexKey, indexList) {
    const title = KEY_TO_TITLE[indexKey];
    const url = indexList.url;

    pipeline.render("pages/api-index.tmpl", {
      documentList: indexList,
      title,
      env: config,
    }, {
      outputFile: path.join(outDir, url),
    });
  }

  for (const [key, list] of Object.entries(index)) {
    outIndex(key, list);
  }
}

function outReference(
  outDir /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  docTree, /*: RootDoc */
) {
  for (const [id, docRecord] of linker.documentRegistry) {
    const {uri: page} = docRecord;

    if (page.includes("#")) {
      continue;// skip fragments (non-standalone docs)
    }

    let doc;

    try {
      doc = idToDoc.get(id);
    } catch (_) {
      continue;
    }

    if (!doc) {
      continue;
    }

    if (doc.type === "PackageDoc") {
      const readmeFile = path.join(doc.location, "README.md");

      outReadme(
        path.join(outDir, page),
        pipeline,
        config,
        readmeFile,
      );
    } else {
      pipeline.render("document.tmpl", {
        docs: [doc],
        title: doc.name,
        env: config,
      }, {
        outputFile: path.join(outDir, page),
      });
    }
  }
}
