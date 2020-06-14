// @flow
// @webdoc/legacy-template uses flow comment syntax for easier migration!

/* global Webdoc */

const _ = require("lodash");
const commonPathPrefix = require("common-path-prefix");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const helper = require("./helper");
const hasOwnProp = Object.prototype.hasOwnProperty;

const {
  TemplateRenderer,
  TemplatePipeline,
  TemplateTagsResolver, // <<TemplatePipelineElement>>
  SymbolLinks,
  RelationsPlugin, // <<TemplateRendererPlugin>>
  RepositoryPlugin, // <<TemplateRendererPlugin>>
} = require("@webdoc/template-library");

const {
  doc: findDoc,
  isClass,
  isInterface,
  isNamespace,
  isMixin,
  isModule,
  isExternal,
  traverse,
} = require("@webdoc/model");

const fsp = require("fs").promises;

const AttributesBuilder = require("./src/AttributesBuilder").AttributesBuilder;
const SignatureBuilder = require("./src/SignatureBuilder").SignatureBuilder;

/*::
import type {TypedMembers} from './helper';
import {TemplateRenderer, TemplatePipeline} from "@webdoc/template-library";

type SourceFile = {
  resolved: string,
  shortened: string
};
*/

let pipeline/*: TemplatePipeline */;
let view/*: TemplateRenderer */;

// linkto will be deprecated in favor of linkTo.
TemplateRenderer.prototype.linkto = SymbolLinks.linkTo;

// TODO: @webdoc/template-library should define linkTo on TemplateRenderer instead of us!
TemplateRenderer.prototype.linkTo = SymbolLinks.linkTo;

// Mixed-in method on TemplateRenderer for resolving the link to a Doc
TemplateRenderer.prototype.resolveDocLink = function(docLink) {
  if (typeof docLink === "string") {
    return this.linkTo(docLink, docLink);
  }

  return this.linkTo(docLink.path, docLink.path);
};

// Mixed-in method on TemplateRenderer for converting strings, Docs into HTML-safe strings
TemplateRenderer.prototype.htmlsafe = (str /*: string | Doc */) /*: string */ => {
  if (typeof str !== "string") {
    if (str.path) {
      str = str.path;
    } else {
      str = String(str);
    }
  }

  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
};

const {Log, LogLevel, tag} = require("missionlog");

const klawSync = require("klaw-sync");

let publishLog;
let docDatabase;

const lsSync = ((dir, opts = {}) => {
  const depth = _.has(opts, "depth") ? opts.depth : -1;

  const files = klawSync(dir, {
    depthLimit: depth,
    filter: ((f) => !path.basename(f.path).startsWith(".")),
    nodir: true,
  });

  return files.map((f) => f.path);
});

let env;

const FONT_NAMES = [
  "OpenSans-Bold",
  "OpenSans-BoldItalic",
  "OpenSans-Italic",
  "OpenSans-Light",
  "OpenSans-LightItalic",
  "OpenSans-Regular",
];
const PRETTIFIER_CSS_FILES = [
  "tomorrow.min.css",
];
const PRETTIFIER_SCRIPT_FILES = [
  "lang-css.js",
  "prettify.js",
];

let outDir;

function mkdirpSync(filepath) {
  return fs.mkdirSync(filepath, {recursive: true});
}

function hashToLink(doclet, hash) {
  let url;

  if ( !/^(#.+)/.test(hash) ) {
    return hash;
  }

  url = SymbolLinks.createLink(doclet);
  url = url.replace(/(#.+|$)/, hash);

  return `<a href="${url}">${hash}</a>`;
}

/*::
type Signature = string
*/

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
  let nav = "";

  if (items.length) {
    let itemsNav = "";

    items.forEach((item) => {
      let displayName;

      if ( !hasOwnProp.call(item, "path") ) {
        itemsNav += `<li>${linktoFn("", item.name)}</li>`;
      } else if ( !hasOwnProp.call(itemsSeen, item.path) ) {
        if (Webdoc.userConfig.template.useLongnameInNav) {
          displayName = item.path;
        } else {
          displayName = item.name;
        }
        publishLog.info(tag.ContentBar, "Linking " + item.path);
        itemsNav += `<li>${linktoFn(item.path, displayName.replace(/\b(module|event):/g, ""))}</li>`;// eslint-disable-line max-len

        itemsSeen[item.path] = true;
      }
    });

    if (itemsNav !== "") {
      nav += `<h3>${itemHeading}</h3><ul>${itemsNav}</ul>`;
    }
  }

  return nav;
}

function linktoExternal(longName, name) {
  return SymbolLinks.linkTo(longName, name.replace(/(^"|"$)/g, ""));
}

// Builds the navigation sidebar's HTML content
function buildNav(members /*: TypedMembers */) /*: string */ {
  let globalNav;
  let nav = "<h2><a href=\"index.html\">Home</a></h2>";
  const seen = {};

  nav += buildMemberNav(members.tutorials, "Tutorials", seen, SymbolLinks.linkTo);
  nav += buildMemberNav(members.modules, "Modules", {}, SymbolLinks.linkTo);
  nav += buildMemberNav(members.externals, "Externals", seen, linktoExternal);
  nav += buildMemberNav(members.namespaces, "Namespaces", seen, SymbolLinks.linkTo);
  nav += buildMemberNav(members.classes, "Classes", seen, SymbolLinks.linkTo);
  nav += buildMemberNav(members.interfaces, "Interfaces", seen, SymbolLinks.linkTo);
  nav += buildMemberNav(members.events, "Events", seen, SymbolLinks.linkTo);
  nav += buildMemberNav(members.mixins, "Mixins", seen, SymbolLinks.linkTo);

  if (members.globals.length) {
    globalNav = "";

    members.globals.forEach(({kind, longname, name}) => {
      if ( kind !== "typedef" && !hasOwnProp.call(seen, longname) ) {
        globalNav += `<li>${SymbolLinks.linkTo(longname, name)}</li>`;
      }
      seen[longname] = true;
    });

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += `<h3>${SymbolLinks.linkTo("global", "Global")}</h3>`;
    } else {
      nav += `<h3>Global</h3><ul>${globalNav}</ul>`;
    }
  }

  return nav;
}

function initLogger(verbose = false) {
  const defaultLevel = verbose ? "INFO" : "WARN";

  publishLog = new Log().init(
    {
      TemplateGenerator: defaultLevel,
      ContentBar: defaultLevel,
      Signature: defaultLevel,
    },
    (level, tag, msg, params) => {
      tag = `[${tag}]:`;
      switch (level) {
      case LogLevel.ERROR:
        console.error(tag, msg, ...params);
        break;
      case LogLevel.WARN:
        console.warn(tag, msg, ...params);
        break;
      case LogLevel.INFO:
        console.info(tag, msg, ...params);
        break;
      default:
        console.log(tag, msg, ...params);
        break;
      }
    });
}

exports.publish = (options /*: PublishOptions */) => {
  initLogger(!!options.verbose);

  docDatabase = options.docDatabase;
  const opts = options.opts;
  const docTree = options.doctree;

  const tutorials = options.tutorials;
  const userConfig = global.Webdoc.userConfig;
  env = options.config;
  outDir = path.normalize(env.opts.destination);

  let cwd;
  const sourceFilePaths /*: Set<string> */ = new Set/*: <string */();
  const sourceFiles = {};
  let staticFilePaths;
  let staticFiles;

  const conf = env.conf.templates || {};
  conf.default = conf.default || {};

  const templatePath = __dirname;

  // Setup template-renderer
  view = new TemplateRenderer(path.join(templatePath, "tmpl"), docDatabase, docTree);
  view.installPlugin("relations", RelationsPlugin);
  view.plugins.relations.buildRelations();

  // Setup repository-plugin for linking source-locations to a remote repository
  if (userConfig.template.repository) {
    view.installPlugin("repository", RepositoryPlugin);
    view.plugins.repository.buildRepository(userConfig.template.repository);
  }

  // Setup template-rendering-pipeline
  pipeline = new TemplatePipeline(view);
  pipeline.pipe(new TemplateTagsResolver());

  // Claim these special file-names beforehand!
  const indexUrl = SymbolLinks.getFileName("index");
  const globalUrl = SymbolLinks.getFileName("global");

  SymbolLinks.registerLink("global", globalUrl);

  // set up templating
  view.layout = "layout.tmpl";

  tutorials.forEach((t) => SymbolLinks.createLink(t));

  // Compile a list of source files
  traverse(docTree, (doc /*: Doc */) => {
    doc.attribs = "";

    if (doc.see) {
      doc.see.forEach((seeItem, i) => {
        doc.see[i] = hashToLink(doc, seeItem);
      });
    }

    // Build a list of source files
    if (doc.loc) {
      const sourcePath = doc.loc.fileName;

      sourceFiles[sourcePath] = {
        resolved: sourcePath,
        shortened: null,
      };

      if (!sourceFilePaths.has(sourcePath)) {
        sourceFilePaths.add(sourcePath);
      }
    }
  });

  fse.ensureDirSync(outDir);

  // Path to @webdoc/legacy-template/static
  const fromDir = path.join(templatePath, "static");

  // Copy the template's static files to outDir
  fse.copy(fromDir, outDir).then(() => {
    // Copy the fonts used by the template to outDir
    staticFiles = lsSync(path.join(require.resolve("open-sans-fonts"), "..", "open-sans"));

    staticFiles.forEach((fileName) => {
      const toPath = path.join(outDir, "fonts", path.basename(fileName));

      if (FONT_NAMES.includes(path.parse(fileName).name)) {
        mkdirpSync(path.dirname(toPath));
        fs.copyFileSync(fileName, toPath);
      }
    });

    // Copy the prettify script to outDir
    PRETTIFIER_SCRIPT_FILES.forEach((fileName) => {
      const toPath = path.join(outDir, "scripts", path.basename(fileName));

      fs.copyFileSync(
        path.join(require.resolve("code-prettify"), "..", fileName),
        toPath,
      );
    });

    // Copy the prettify CSS to outDir
    PRETTIFIER_CSS_FILES.forEach((fileName) => {
      const toPath = path.join(outDir, "styles", path.basename(fileName));

      fs.copyFileSync(
        require.resolve("color-themes-for-google-code-prettify/dist/themes/" + fileName),
        toPath,
      );
    });

    // Copy user-specified static files to outDir
    if (userConfig.template.staticFiles) {
      staticFilePaths =
        userConfig.template.staticFiles.include ||
        userConfig.template.staticFiles.paths ||
        [];
      cwd = process.cwd();

      staticFilePaths.forEach((filePath) => {
        const destPath = path.resolve(path.join(outDir, path.relative(fromDir, filePath)));

        filePath = path.resolve(cwd, filePath);

        fse.copy(filePath, destPath).catch((e) => {
          throw e;
        });
      });
    }
  }).catch((e) => {
    throw e;
  });

  const sourceFileNames /*: Set<string */ = new Set/*: <string > */();

  if (sourceFilePaths.size) {
    const commonDir = commonPathPrefix([...sourceFilePaths]);

    Object.keys(sourceFiles).forEach((file) => {
      sourceFiles[file].shortened = sourceFiles[file].resolved.replace(commonDir, "")
        .replace(/\\/g, "/");// always use forward slashes
    });

    for (const filePath in sourceFiles) {
      // eslint-disable-next-line no-prototype-builtins
      if (sourceFiles.hasOwnProperty(filePath)) {
        const sourceFile = sourceFiles[filePath];
        sourceFileNames.add(sourceFile.shortened);
      }
    }
  }

  // Create a hyperlink for each document
  traverse(docTree, (doc /*: Doc */) => {
    if (doc.type === "RootDoc") {
      return;
    }

    const url = SymbolLinks.createLink(doc);

    SymbolLinks.registerLink(
      doc.path,
      url,
    );
  });

  // Generate an ID and build signature, attributes for each document, resolve ancestors
  traverse(docTree, (doc /*: Doc */) => {
    if (doc.type === "RootDoc") {
      return;
    }

    const url = SymbolLinks.pathToUrl.get(doc.path);

    if (url.includes("#")) {
      doc.id = url.split(/#/).pop();
    } else {
      doc.id = doc.name;
    }

    // Add signature, attributes information to the doc
    if (SignatureBuilder.needsSignature(doc)) {
      SignatureBuilder.appendParameters(doc);
      SignatureBuilder.appendReturns(doc);
      AttributesBuilder.appendAttribs(doc);
    }

    doc.ancestors = SymbolLinks.getAncestorLinks(doc);

    if (doc.type === "PropertyDoc" || doc.type === "EnumDoc") {
      SignatureBuilder.appendTypes(doc);
      AttributesBuilder.appendAttribs(doc);
    }
  });

  const members = helper.getTypedMembers(docTree);
  members.tutorials = tutorials;

  function tutorialLinkGen(tut) {
    SymbolLinks.createLink(tut);
    tut.members.forEach((c) => tutorialLinkGen(c));
  }

  tutorials.forEach((t) => tutorialLinkGen(t));

  const outputSourceFiles = userConfig.template.outputSourceFiles;

  // once for all
  view.nav = buildNav(members);

  // generate the pretty-printed source files first so other pages can link to them
  if (outputSourceFiles) {
    generateSourceFiles(sourceFiles, opts.encoding);
  }
  if (members.globals.length) {
    generate("Global", [{type: "globals"}], globalUrl);
  }

  generateHomePage(indexUrl, docTree);

  const docPaths = SymbolLinks.pathToUrl.keys();
  let docPathEntry = docPaths.next();
  let docPath = docPathEntry.value;

  while (!docPathEntry.done) {
    let doc;

    // Sometimes docPath is undefined!
    if (docPath) {
      doc = findDoc(docPath, docTree);
    }

    if (!doc) {
      if (!sourceFilePaths.has(docPath) &&
            !sourceFileNames.has(docPath) &&
            docPath !== "index" &&
            docPath !== "global") {
        console.log(docPath + " doesn't point to a doc");
      }
    } else {
      const docUrl = SymbolLinks.pathToUrl.get(docPath);

      if (isClass(doc)) {
        generate(`Class: ${doc.name}`, [doc], docUrl);
      } else if (isInterface(doc)) {
        generate(`Interface: ${doc.name}`, [doc], docUrl);
      } else if (isNamespace(doc)) {
        generate(`Namespace: ${doc.name}`, [doc], docUrl);
      } else if (isMixin(doc)) {
        generate(`Mixin: ${doc.name}`, [doc], docUrl);
      } else if (isModule(doc)) {
        generate(`Module: ${doc.name}`, [doc], docUrl);
      } else if (isExternal(doc)) {
        generate(`External: ${doc.name}`, [doc], docUrl);
      }
    }

    // Update docPathEntry & docPath together
    docPathEntry = docPaths.next();
    docPath = docPathEntry.value;
  }

  const generatedTutorials = new Set/*: <string> */();

  // tutorials can have only one parent so there is no risk for loops
  function generateTutorialRecursive({members}) {
    members.forEach((child) => {
      if (generatedTutorials.has(child.name)) {
        return;
      }

      generateTutorial(`Tutorial: ${child.title}`, child, SymbolLinks.pathToUrl.get(child.path));
      generateTutorialRecursive(child);

      generatedTutorials.add(child.name);
    });
  }

  generateTutorialRecursive({members: tutorials});
};

// Generate a HTML page that contains the documentation for the given docs.
function generate(title, docs, filename) {
  const docData = {
    env: env,
    title: title,
    docs: docs,
  };

  const outpath = path.join(outDir, filename);
  const html = pipeline.render("container.tmpl", docData);

  fs.writeFile(outpath, html, "utf8", (err) => {
    if (!err) {
      return;
    }

    console.error("@webdoc/<template>: Couldn't write file " + outpath);

    throw err;
  });
}

// Generate the home page, this loads the top-level members, packages, and README
async function generateHomePage(pagePath /*: string */, rootDoc /*: RootDoc */) /*: void */ {
  const userConfig = Webdoc.userConfig;

  // index page displays information from package.json and lists files
  const files = docDatabase({kind: "file"}).get();
  const packages = docDatabase({kind: "package"}).get();

  const arr = rootDoc.members.filter((doc) =>
    doc.type === "FunctionDoc" ||
      doc.type === "EnumDoc" ||
      doc.type === "MethodDoc" ||
      doc.type === "PropertyDoc" ||
      doc.type === "TypedefDoc");

  const readme = userConfig.template.readme;
  let readmeContent = "";

  if (readme) {
    const readmePath = path.join(process.cwd(), readme);

    readmeContent = await fsp.readFile(readmePath, "utf8");

    const markdownRenderer = require("markdown-it")({
      breaks: false,
      html: true,
    })
      .use(require("markdown-it-highlightjs"));

    readmeContent = markdownRenderer.render(readmeContent);
  }

  generate("Home",
    packages.concat(
      [{
        type: "mainPage",
        readme: readmeContent,
        path: userConfig.template.mainPage.title,
        children: arr,
        members: arr,
      }],
    ).concat(files), pagePath);
}

// Generate a tutorial page
function generateTutorial(title /*: string */, tutorial /*: Tutorial */, filename /*: string */) {
  const tutorialData = {
    title: title,
    header: tutorial.title,
    content: tutorial.content,
    children: tutorial.members,
  };

  const tutorialPath = path.join(outDir, filename);
  const html = view.render("tutorial.tmpl", tutorialData);

  fs.writeFileSync(tutorialPath, html, "utf8");
}

// Generate the source-file pages
function generateSourceFiles(sourceFiles, encoding = "utf8") {
  Object.keys(sourceFiles).forEach((file) => {
    let source;
    // links are keyed to the shortened path in each doclet's `meta.shortpath` property
    const sourceOutfile = SymbolLinks.getFileName(sourceFiles[file].shortened);

    SymbolLinks.registerLink(sourceFiles[file].shortened, sourceOutfile);
    SymbolLinks.registerLink(sourceFiles[file].resolved, sourceOutfile);

    try {
      source = {
        type: "sourceFile",
        code: helper.toHtmlSafeString( fs.readFileSync(sourceFiles[file].resolved, encoding) ),
      };
    } catch (e) {
      publishLog.error("SourceFile", `Error while generating source file ${file}: ${e.message}`);
    }

    generate(`Source: ${sourceFiles[file].shortened}`, [source], sourceOutfile, false);
  });
}
