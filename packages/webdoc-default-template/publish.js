// @flow

// $FlowFixMe
const {Worker} = require("worker_threads");
const {crawl} = require("./helper/crawl");
const fs = require("fs");
const fse = require("fs-extra");
const hljs = require("highlight.js");
const os = require("os");
const path = require("path");
const {traverse} = require("@webdoc/model");
const {
  FlushToFile,
  RelationsPlugin,
  Sitemap,
  TemplateRenderer,
  TemplatePipeline,
  TemplateTagsResolver,
  RepositoryPlugin,
} = require("@webdoc/template-library");
const {linker, prepareLinker} = require("./helper/linker");
const _ = require("lodash");

// Plugins
const {indexSorterPlugin} = require("./helper/renderer-plugins/index-sorter");
const {signaturePlugin} = require("./helper/renderer-plugins/signature");
const {categoryFilterPlugin} = require("./helper/renderer-plugins/category-filter");
const {preprocessMarkupPlugin} = require("./helper/renderer-plugins/preprocess");
/*::
import type {
  Doc,
  RootDoc,
  SourceFile,
  TutorialDoc,
} from "@webdoc/types";

import type {CrawlData} from './helper/crawl';

type AppBarItem = {
  name: string;
  uri: string;
};

type AppBarData = {
  current: string;
  items: { [id: string]: AppBarItem };
};
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

exports.publish = async function publish(options /*: PublishOptions */) {
  const config = options.config;
  const source = options.source;

  await prepareLinker(config);

  const docTree = options.documentTree;
  const outDir = path.normalize(options.config.opts.destination);
  const assetsDir = path.join(outDir, "./assets");
  const index = config.template.readme ? linker.createURI("index") : null;
  const indexRelative = index ? index.replace(`/${linker.siteRoot}/`, "") : null;

  fse.ensureDir(outDir);

  const crawlData = crawl(options.manifest, index);
  const alias = _.merge(
    {
      "bottom-banner": path.join(__dirname, "tmpl/components/bottom-banner/index.tmpl"),
      "explorer": path.join(__dirname, "tmpl/components/explorer/index.tmpl"),
      "footer": path.join(__dirname, "tmpl/components/footer/index.tmpl"),
      "header": path.join(__dirname, "tmpl/components/header/index.tmpl"),
      "tutorial": path.join(__dirname, "tmpl/tutorial.tmpl"),
    },
    config.template.alias,
  );
  const appBarItems = _.merge({}, config.template.appBar.items, {
    /* NOTE: config.template.appBar.items is the primary object so we retain the order as the user
        desires. */
    ...(crawlData.reference && {
      "reference": {
        name: "API Reference",
        uri: index,
      },
    }),
    ...(crawlData.tutorials && {
      "tutorials": {
        name: "Tutorials",
        uri: crawlData.tutorials.page ||
          crawlData.tutorials.children[Object.keys(crawlData.tutorials.children)[0]].page,
      },
    }),
  }, _.pick(config.template.appBar.items, [
    "reference",
    "tutorials",
  ]));
  const layoutTemplate = config.template.alias.layout ?
    path.resolve(process.cwd(), config.template.alias.layout) :
    "layout.tmpl";

  const renderer = new TemplateRenderer(path.join(__dirname, "tmpl"), null, docTree)
    .alias(alias)
    .setLayoutTemplate(layoutTemplate)
    .installPlugin("linker", linker)
    .installPlugin("generateIndex", indexSorterPlugin)
    .installPlugin("signature", signaturePlugin)
    .installPlugin("categoryFilter", categoryFilterPlugin)
    .installPlugin("relations", RelationsPlugin)
    .installPlugin("hljs", hljs)
    .installPlugin("preprocess", preprocessMarkupPlugin({
      assetsDir: path.relative(outDir, assetsDir),
      siteRoot: config.template.siteRoot,
    }))
    .setGlobalTemplateData({
      appBar: {
        items: appBarItems,
      },
      variant: config.template.variant,
    });
  if (config.template.repository) {
    renderer.installPlugin("repository", RepositoryPlugin);
    renderer.plugins.repository.buildRepository(config.template.repository);
  }

  const pipeline = new TemplatePipeline(renderer).pipe(new TemplateTagsResolver());

  if (config.template.siteDomain) {
    pipeline.pipe(new Sitemap(
      outDir,
      config.template.siteDomain,
      config.template.siteRoot));
  }

  pipeline.pipe(new FlushToFile({skipNullFile: false}));

  renderer.getPlugin("relations").buildRelations();

  idToDoc = new Map();

  traverse(docTree, (doc) => {
    if (doc.type === "RootDoc") {
      doc.packages.forEach((pkg) => {
        idToDoc.set(pkg.id, pkg);
      });
    }
    idToDoc.set(doc.id, doc);
  });

  await outStaticFiles(outDir, assetsDir, config);
  await Promise.all([
    outSource(outDir, pipeline, options.config, source, options.cmdLine.mainThread || false),
    outExplorerData(outDir, crawlData),
    outMainPage(indexRelative ? path.join(outDir, indexRelative) : null, pipeline, options.config),
    outIndexes(outDir, pipeline, options.config, crawlData.index),
    outReference(outDir, pipeline, options.config, docTree, crawlData.reference),
    outTutorials(outDir, pipeline, options.config, docTree, crawlData.tutorials),
  ]);

  pipeline.close();
};

// Copy the contents of ./static to the output directory
async function outStaticFiles(
  outDir /*: string */,
  assetsDir /*: string */,
  config /*: ConfigSchema */,
) /*: Promise<void> */ {
  if (config.template.variant !== "plain") {
    const staticDir = path.join(__dirname, "./static");

    await fse.copy(staticDir, outDir);
  }

  await Promise.all([
    (async () => {
      if (config.variant !== "plain") {
        // Copy the prettify script to outDir
        PRETTIFIER_SCRIPT_FILES.forEach((fileName) => {
          const toPath = path.join(outDir, "scripts", path.basename(fileName));

          fse.copyFileSync(
            path.join(require.resolve("code-prettify"), "..", fileName),
            toPath,
          );
        });
      }
    })(),
    (() => {
      // Copy the stylesheets
      const stylesheets = config.template.stylesheets;
      const copyPromises = [];
      const resolved = [];

      for (const file of stylesheets) {
        const out = path.join(outDir, file);

        resolved.push(path.relative(outDir, out));
        copyPromises.push(fse.copy(
          path.join(process.cwd(), file),
          out,
        ));
      }

      config.template.stylesheets = resolved;

      return Promise.all(copyPromises);
    })(),
    (() => {
      const assets = typeof config.template.assets === "string" ?
        [config.template.assets] : config.template.assets;
      const copyPromises = [];

      for (const asset of assets) {
        copyPromises.push(fse.copy(
          path.join(process.cwd(), asset),
          assetsDir,
        ));
      }

      return Promise.all(copyPromises);
    })(),
  ]);
}

// Write the explorer JSON data in the output directory
async function outExplorerData(
  outDir /*: string */,
  crawlData /*: CrawlData */,
) /*: Promise<void> */ {
  const explorerDir = path.join(outDir, "./explorer");

  return fse.ensureDir(explorerDir).then(() => new Promise((resolve) => {
    fse.writeFile(
      path.join(explorerDir, "./reference.json"),
      JSON.stringify(crawlData.reference),
      "utf8",
      (err) => {
        if (err) throw err;
      });

    if (crawlData.tutorials) {
      fse.writeFile(
        path.join(explorerDir, "./tutorials.json"),
        JSON.stringify(crawlData.tutorials),
        "utf8",
        (err) => {
          if (err) throw err;
          resolve();
        },
      );
    } else {
      resolve();
    }
  }));
}

// Render the main-page into index.tmpl (outputFile)
async function outMainPage(
  outputFile /*: ?string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
)/*: Promise<void> */ {
  if (outputFile && config.template.readme) {
    const readmeFile = path.join(process.cwd(), config.template.readme);

    outReadme(
      outputFile,
      pipeline,
      config,
      readmeFile,
    );
  }
}

async function outSource(
  outDir /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: ConfigSchema */,
  source /*: ?$ReadOnlyArray<SourceFile> */,
  mainThread /*:: ?: boolean */,
)/*: Promise<void> */ {
  if (!source || !config.template.sources) return;

  function renderSource(file /*: SourceFile */, raw /*: string */) {
    const pkgName = file.package.name || "";
    const pkgRelativePath = path.relative(file.package.location || "", file.path);
    const outFile = path.join(pkgName, pkgRelativePath + ".html");

    pipeline.render("source.tmpl", {
      appBar: {current: "sources"},
      env: config,
      raw,
      title: path.basename(file.path),
    }, {
      outputFile: path.join(outDir, outFile),
    });
  }

  const workerCount = Math.min(os.cpus().length, 1 + Math.floor(source.length / 32));

  if (workerCount > 1 && !mainThread) {
    const workers = new Array(workerCount);
    const renderJobs/*: Array<{
      resolve: Function,
      reject: Function,
      promise: Promise<void>,
    }> */ = new Array(source.length);// eslint-disable-line operator-linebreak

    const onMessage = function onMessage(
      {
        id,
        file,
        error,
        result,
      } /*: {
        id: number,
        file: string,
        error: boolean,
        result: ?string }
      */,
    ) {
      if (error || typeof result !== "string") {
        renderJobs[id].reject("Error in highlighting worker");
      } else {
        const raw = result;
        const sourceFile = source[id];

        renderSource(sourceFile, raw);
        renderJobs[id].resolve();
      }
    };

    const startTime = Date.now();
    console.log("Creating " + workerCount + " workers for highlighting source code.");

    for (let i = 0; i < workers.length; i++) {
      workers[i] = new Worker(path.resolve(__dirname, "./helper/workers/hl.js"));
      workers[i].on("message", onMessage);
    }

    for (let i = 0; i < source.length; i++) {
      let resolveFn/*: () => void */;
      let rejectFn/*: () => void */;
      const promise = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
      });
      renderJobs[i] = {resolve: resolveFn, reject: rejectFn, promise};

      workers[i % workers.length].postMessage({
        id: i,
        file: source[i].path,
      });
    }

    await Promise.all(renderJobs.map((job) => job.promise));
    await Promise.all(workers.map((worker) => worker.terminate()));

    console.log("Rendering sources took " + (Date.now() - startTime) + "ms time!");
  } else {
    for (const file of source) {
      const raw = hljs.highlightAuto(
        fs.readFileSync(path.resolve(process.cwd(), file.path), "utf8"),
      ).value;
      renderSource(file, raw);
    }
  }
}

async function outReadme(
  outputFile /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  readmeFile /*: string */,
)/*: Promise<void> */ {
  if (!(await fse.pathExists(readmeFile))) {
    return;
  }

  let readme;

  if (readmeFile.endsWith(".md")) {
    const markdownRenderer = require("markdown-it")({
      breaks: false,
      html: true,
      highlight: function(str, lang) {
        if (lang === "mermaid") {
          try {
            return "<div class=\"mermaid\">\n" + str + "\n</div>";
          } catch (__) {/* noop */}
        } else if (lang && hljs.getLanguage(lang)) {
          try {
            return "<pre class=\"hljs\"><code>" +
              hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
              "</code></pre>";
          } catch (__) {/* noop */}
        }

        return "<pre class=\"hljs\"><code>" + (str) + "</code></pre>";
      },
    });
    const markdownSource = await fse.readFile(readmeFile, "utf8");

    readme = markdownRenderer.render(markdownSource);
  }

  pipeline.render("pages/main-page.tmpl", {
    appBar: {current: "reference"},
    document: null,
    readme,
    title: "Documentation",
    env: config,
  }, {outputFile});
}

async function outIndexes(
  outDir /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  index /*: Index */,
)/*: Promise<void> */ {
  const KEY_TO_TITLE = {
    "classes": "Class Index",
  };

  function outIndex(indexKey, indexList /*: Array<Doc> */) {
    if (indexList.length > 0) {
      const title = KEY_TO_TITLE[indexKey];
      const url = linker.processInternalURI(indexList.url, {outputRelative: true});

      pipeline.render("pages/api-index.tmpl", {
        appBar: {current: "reference"},
        documentList: indexList,
        title,
        env: config,
      }, {
        outputFile: path.join(outDir, url),
      });
    }
  }

  for (const [key, list] of Object.entries(index)) {
    outIndex(key, list);
  }
}

async function outReference(
  outDir /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  docTree /*: RootDoc */,
  explorerData /* any */,
)/*: Promise<void> */ {
  // Don't output if nothing's there
  if (!docTree.members.length) {
    return;
  }

  for (const [id, docRecord] of linker.documentRegistry) {
    let {uri: page} = docRecord;

    if (page.includes("#")) {
      continue;// skip fragments (non-standalone docs)
    }

    page = linker.processInternalURI(page, {outputRelative: true});
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
        appBar: {current: "reference"},
        document: doc,
        explorerData,
        sources: config.template.sources,
        title: doc.name,
        require,
        env: config,
      }, {
        outputFile: path.join(outDir, page),
      });
    }
  }
}

async function outTutorials(
  outDir /*: string */,
  pipeline /*: TemplatePipeline */,
  config /*: WebdocConfig */,
  docTree /*: RootDoc */,
  explorerData /* any */,
)/*: Promise<void> */ {
  function out(parent /*: { members: any[] } */) {
    return function renderRecursive(tutorial /*: TutorialDoc */, i /*: number */) {
      const uri = linker.getURI(tutorial, true);

      pipeline.render("tutorial", {
        appBar: {current: "tutorials"},
        document: tutorial,
        explorerData,
        title: tutorial.title,
        env: config,
        navigation: {
          next: parent && parent.members[i + 1] && parent.members[i + 1].route ?
            parent.members[i + 1] : null,
          previous: parent && parent.members[i - 1] && parent.members[i - 1].route ?
            parent.members[i - 1] : null,
        },
      }, {
        outputFile: path.join(outDir, uri),
      });

      if (tutorial.members.length > 0) {
        tutorial.members.forEach((out(tutorial) /*: any */));
      }
    };
  }

  docTree.tutorials.forEach((out({members: docTree.tutorials}) /*: any */));
}
