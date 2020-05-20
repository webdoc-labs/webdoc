// @flow
// @webdoc/legacy-template uses flow comment syntax for easier migration!

const _ = require("lodash");
const commonPathPrefix = require("common-path-prefix");
const fs = require("fs");
const path = require("path");
const {taffy} = require("taffydb");
const helper = require("./helper");
const hasOwnProp = Object.prototype.hasOwnProperty;
const {TemplateRenderer, SymbolLinks} = require("@webdoc/template-library");
const {doc: findDoc, isClass, isInterface, isNamespace, isMixin, isModule, isExternal} = require("@webdoc/model");

TemplateRenderer.prototype.linkto = helper.linkto;
TemplateRenderer.prototype.linkTo = helper.linkto;

TemplateRenderer.prototype.resolveDocLink = function(docLink) {
  if (typeof docLink === "string") {
    return this.linkTo(docLink, docLink);
  }

  return this.linkTo(docLink.path, docLink.path);
};

const htmlsafe = TemplateRenderer.prototype.htmlsafe = (str) => {
  if (typeof str !== "string") {
    str = String(str);
  }

  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
};

const {Log, LogLevel, tag} = require("missionlog");

const linkto = helper.linkto;
const klawSync = require("klaw-sync");

let publishLog;
let docDatabase;

lsSync = ((dir, opts = {}) => {
  const depth = _.has(opts, "depth") ? opts.depth : -1;

  const files = klawSync(dir, {
    depthLimit: depth,
    filter: ((f) => !path.basename(f.path).startsWith(".")),
    nodir: true,
  });

  return files.map((f) => f.path);
});


const log = (s) => {
  console.log(s);
};

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

let data;
let view;

let outdir;

function mkdirpSync(filepath) {
  return fs.mkdirSync(filepath, {recursive: true});
}

function find(spec) {
  return data(spec).get();
}

function tutoriallink(tutorial) {
  return helper.toTutorial(tutorial, null, {
    tag: "em",
    classname: "disabled",
    prefix: "Tutorial: ",
  });
}

function getAncestorLinks(doclet) {
  return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
  let url;

  if ( !/^(#.+)/.test(hash) ) {
    return hash;
  }

  url = helper.createLink(doclet);
  url = url.replace(/(#.+|$)/, hash);

  return `<a href="${url}">${hash}</a>`;
}

/*::
type Signature = {
  params: [Param],
  returns: [Return]
}
*/

function needsSignature(doc /*: Doc */) /*: boolean */ {
  // Functions, methods, and properties always have signatures.
  if (doc.type === "FunctionDoc" || doc.type === "MethodDoc") {
    return true;
  }
  // Class constructors documented as classes have signatures.
  if (doc.type === "ClassDoc" && doc.params) {
    return true;
  }

  // TODO: Need to resolve this one!
  /*
  // Typedefs containing functions have signatures.
  if (doc.type === "TypedefDoc" && doc.of && type.names &&
        type.names.length) {
    for (let i = 0, l = type.names.length; i < l; i++) {
      if (type.names[i].toLowerCase() === "function") {
        return true;
      }
    }
  }*/

  return false;
}

function getSignatureAttributes({optional, nullable}) {
  const attributes = [];

  if (optional) {
    attributes.push("opt");
  }

  if (nullable === true) {
    attributes.push("nullable");
  } else if (nullable === false) {
    attributes.push("non-null");
  }

  return attributes;
}

const SignatureBuilder = {
  appendParameters(params) {
    return params
      .filter((param) => param.identifer && !param.identifer.includes("."))
      .map(
        (item) => {
          const attributes = getSignatureAttributes(item);
          let itemName = item.identifer || "";

          if (item.variadic) {
            itemName = `&hellip;${itemName}`;
          }

          if (attributes && attributes.length) {
            itemName = `${itemName}<span class="signature-attributes">${attributes.join(", ")}</span>`;
          }

          return itemName;
        });
  },
};

function buildItemTypeStrings(item) {
  const types = [];

  if (item && item.dataType && item.dataType.length) {
    item.dataType.slice(1).forEach((name) => {
      types.push(linkto(name, htmlsafe(name)) );
    });
  }

  return types;
}

function buildAttribsString(attribs) {
  let attribsString = "";

  if (attribs && attribs.length) {
    attribsString = htmlsafe(`(${attribs.join(", ")}) `);
  }

  return attribsString;
}

function addNonParamAttributes(items) {
  let types = [];

  items.forEach((item) => {
    types = types.concat( buildItemTypeStrings(item) );
  });

  return types;
}

function addSignatureParams(f /*: Signature */) {
  const params = f.params ? SignatureBuilder.appendParameters(f.params) : [];

  f.signature = `${f.signature || ""}(${params.join(", ")})`;
}

function addSignatureReturns(f) {
  const attribs = [];
  let attribsString = "";
  let returnTypes = [];
  let returnTypesString = "";
  const source = f.yields || f.returns;

  // jam all the return-type attributes into an array. this could create odd results (for example,
  // if there are both nullable and non-nullable return types), but let's assume that most people
  // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
  if (source) {
    source.forEach((item) => {
      helper.Attributes(item).forEach((attrib) => {
        if (!attribs.includes(attrib)) {
          attribs.push(attrib);
        }
      });
    });

    attribsString = buildAttribsString(attribs);
  }

  if (source) {
    returnTypes = addNonParamAttributes(source);
  }
  if (returnTypes.length) {
    returnTypesString = ` &rarr; ${attribsString}{${returnTypes.join("|")}}`;
  }

  f.signature = `<span class="signature">${f.signature || ""}</span>` +
        `<span class="type-signature">${returnTypesString}</span>`;
}

function addSignatureTypes(f) {
  const types = f.type ? buildItemTypeStrings(f) : [];

  f.signature = `${f.signature || ""}<span class="type-signature">` +
        `${types.length ? ` :${types.join("|")}` : ""}</span>`;
}

function addAttribs(f) {
  const attribs = helper.Attributes(f);
  const attribsString = buildAttribsString(attribs);

  f.attribs = `<span class="type-signature">${attribsString}</span>`;
}

function shortenPaths(files, commonPrefix) {
  Object.keys(files).forEach((file) => {
    files[file].shortened = files[file].resolved.replace(commonPrefix, "")
    // always use forward slashes
      .replace(/\\/g, "/");
  });

  return files;
}

function getPathFromDoclet({meta}) {
  if (!meta) {
    return null;
  }

  return meta.path && meta.path !== "null" ?
    path.join(meta.path, meta.filename) :
    meta.filename;
}

function generate(title, docs, filename, resolveLinks) {
  let docData;
  let html;
  let outpath;

  resolveLinks = resolveLinks !== false;

  docData = {
    env: env,
    title: title,
    docs: docs,
  };

  outpath = path.join(outdir, filename);
  html = view.render("container.tmpl", docData);

  if (resolveLinks) {
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
  }

  fs.writeFileSync(outpath, html, "utf8");
}

function generateSourceFiles(sourceFiles, encoding = "utf8") {
  Object.keys(sourceFiles).forEach((file) => {
    let source;
    // links are keyed to the shortened path in each doclet's `meta.shortpath` property
    const sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);

    helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

    try {
      source = {
        kind: "source",
        code: helper.htmlsafe( fs.readFileSync(sourceFiles[file].resolved, encoding) ),
      };
    } catch (e) {
      log.error(`Error while generating source file ${file}: ${e.message}`);
    }

    generate(`Source: ${sourceFiles[file].shortened}`, [source], sourceOutfile,
      false);
  });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
  const symbols = {};

  // build a lookup table
  doclets.forEach((symbol) => {
    symbols[symbol.longname] = symbols[symbol.longname] || [];
    symbols[symbol.longname].push(symbol);
  });

  modules.forEach((module) => {
    if (symbols[module.longname]) {
      module.modules = symbols[module.longname]
      // Only show symbols that have a description. Make an exception for classes, because
      // we want to show the constructor-signature heading no matter what.
        .filter(({description, kind}) => description || kind === "class")
        .map((symbol) => {
          symbol = _.cloneDeep(symbol);

          if (symbol.kind === "class" || symbol.kind === "function") {
            symbol.name = `${symbol.name.replace("module:", "(require(\"")}"))`;
          }

          return symbol;
        });
    }
  });
}

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
  let nav = "";

  if (items.length) {
    let itemsNav = "";

    items.forEach((item) => {
      let displayName;

      if ( !hasOwnProp.call(item, "path") ) {
        itemsNav += `<li>${linktoFn("", item.name)}</li>`;
      } else if ( !hasOwnProp.call(itemsSeen, item.path) ) {
        if (true) { //env.conf.templates.default.useLongnameInNav) {
          displayName = item.path;
        } else {
          displayName = item.name;
        }
        publishLog.warn(tag.ContentBar, "Linking " + item.path);
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

function linktoTutorial(longName, name) {
  return tutoriallink(name);
}

function linktoExternal(longName, name) {
  return linkto(longName, name.replace(/(^"|"$)/g, ""));
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
  let globalNav;
  let nav = "<h2><a href=\"index.html\">Home</a></h2>";
  const seen = {};
  const seenTutorials = {};

  nav += buildMemberNav(members.modules, "Modules", {}, linkto);
  nav += buildMemberNav(members.externals, "Externals", seen, linktoExternal);
  nav += buildMemberNav(members.namespaces, "Namespaces", seen, linkto);
  nav += buildMemberNav(members.classes, "Classes", seen, linkto);
  nav += buildMemberNav(members.interfaces, "Interfaces", seen, linkto);
  nav += buildMemberNav(members.events, "Events", seen, linkto);
  nav += buildMemberNav(members.mixins, "Mixins", seen, linkto);
  nav += buildMemberNav(members.tutorials, "Tutorials", seenTutorials, linktoTutorial);

  if (members.globals.length) {
    globalNav = "";

    members.globals.forEach(({kind, longname, name}) => {
      if ( kind !== "typedef" && !hasOwnProp.call(seen, longname) ) {
        globalNav += `<li>${linkto(longname, name)}</li>`;
      }
      seen[longname] = true;
    });

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += `<h3>${linkto("global", "Global")}</h3>`;
    } else {
      nav += `<h3>Global</h3><ul>${globalNav}</ul>`;
    }
  }

  return nav;
}

function sourceToDestination(parentDir, sourcePath, destDir) {
  const relativeSource = path.relative(parentDir, sourcePath);

  return path.resolve(path.join(destDir, relativeSource));
}

function initLogger() {
  const defaultLevel = "INFO";

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

exports.publish = (options) => {
  initLogger();

  docDatabase = options.docDatabase;
  const opts = options.opts;
  const docTree = options.doctree;
  const tutorials = options.tutorials;
  env = options.config;
  outdir = path.normalize(env.opts.destination);

  let conf;
  let cwd;
  let fromDir;
  let globalUrl;
  let indexUrl;
  let outputSourceFiles;
  let packageInfo;
  const sourceFilePaths = [];
  let sourceFiles = {};
  let staticFileFilter;
  let staticFilePaths;
  let staticFiles;
  let staticFileScanner;
  let templatePath;

  data = docDatabase;

  conf = env.conf.templates || {};
  conf.default = conf.default || {};

  templatePath = __dirname;

  view = new TemplateRenderer(path.join(templatePath, "tmpl"), docDatabase);

  // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
  // doesn't try to hand them out later
  indexUrl = helper.getUniqueFilename("index") + ".html";
  // don't call registerLink() on this one! 'index' is also a valid longname

  globalUrl = helper.getUniqueFilename("global") + ".html";
  // helper.registerLink("global", globalUrl);

  // set up templating
  view.layout = conf.default.layoutFile ?
    path.resolve(conf.default.layoutFile) :
    "layout.tmpl";

  // set up tutorials for helper
  // helper.setTutorials(tutorials);

  // data = helper.prune(data);
  data.sort("path, version, since");
  // helper.addEventListeners(data);

  data().each((doclet) => {
    let sourcePath;

    doclet.attribs = "";

    if (doclet.examples) {
      doclet.examples = doclet.examples.map((example) => {
        let caption;
        let code;

        if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
          caption = RegExp.$1;
          code = RegExp.$3;
        }

        return {
          caption: caption || "",
          code: code || example,
        };
      });
    }
    if (doclet.see) {
      doclet.see.forEach((seeItem, i) => {
        doclet.see[i] = hashToLink(doclet, seeItem);
      });
    }

    // build a list of source files
    if (doclet.meta) {
      sourcePath = getPathFromDoclet(doclet);
      sourceFiles[sourcePath] = {
        resolved: sourcePath,
        shortened: null,
      };
      if (!sourceFilePaths.includes(sourcePath)) {
        sourceFilePaths.push(sourcePath);
      }
    }
  });

  // update outdir if necessary, then create outdir
  packageInfo = ( find({kind: "package"}) || [] )[0];
  if (packageInfo && packageInfo.name) {
    outdir = path.join( outdir, packageInfo.name, (packageInfo.version || "") );
  }
  mkdirpSync(outdir);

  // copy the template's static files to outdir
  fromDir = path.join(templatePath, "static");
  staticFiles = lsSync(fromDir);

  staticFiles.forEach((fileName) => {
    const toPath = sourceToDestination(fromDir, fileName, outdir);

    mkdirpSync(path.dirname(toPath));
    fs.copyFileSync(fileName, toPath);
  });

  // copy the fonts used by the template to outdir
  staticFiles = lsSync(path.join(require.resolve("open-sans-fonts"), "..", "open-sans"));

  staticFiles.forEach((fileName) => {
    const toPath = path.join(outdir, "fonts", path.basename(fileName));

    if (FONT_NAMES.includes(path.parse(fileName).name)) {
      mkdirpSync(path.dirname(toPath));
      fs.copyFileSync(fileName, toPath);
    }
  });

  // copy the prettify script to outdir
  PRETTIFIER_SCRIPT_FILES.forEach((fileName) => {
    const toPath = path.join(outdir, "scripts", path.basename(fileName));

    fs.copyFileSync(
      path.join(require.resolve("code-prettify"), "..", fileName),
      toPath,
    );
  });

  // copy the prettify CSS to outdir
  PRETTIFIER_CSS_FILES.forEach((fileName) => {
    const toPath = path.join(outdir, "styles", path.basename(fileName));

    fs.copyFileSync(
      require.resolve("color-themes-for-google-code-prettify/dist/themes/" + fileName),
      toPath,
    );
  });

  // copy user-specified static files to outdir
  if (conf.default.staticFiles) {
    // The canonical property name is `include`. We accept `paths` for backwards compatibility
    // with a bug in JSDoc 3.2.x.
    staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
    staticFileFilter = new (require("jsdoc/src/filter").Filter)(conf.default.staticFiles);
    staticFileScanner = new (require("jsdoc/src/scanner").Scanner)();
    cwd = process.cwd();

    staticFilePaths.forEach((filePath) => {
      let extraStaticFiles;

      filePath = path.resolve(cwd, filePath);
      extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

      extraStaticFiles.forEach((fileName) => {
        const toPath = sourceToDestination(fromDir, fileName, outdir);

        mkdirpSync(path.dirname(toPath));
        fs.copyFileSync(fileName, toPath);
      });
    });
  }

  if (sourceFilePaths.length) {
    sourceFiles = shortenPaths( sourceFiles, commonPathPrefix(sourceFilePaths) );
  }

  // Create a hyperlink for each documented symbol.
  data().each((doclet) => {
    let docletPath;
    const url = helper.createLink(doclet);

    helper.registerLink(doclet.path, url);

    // add a shortened version of the full path
    if (doclet.meta) {
      docletPath = getPathFromDoclet(doclet);
      docletPath = sourceFiles[docletPath].shortened;
      if (docletPath) {
        doclet.meta.shortpath = docletPath;
      }
    }
  });

  data().each((doc) => {
    const url = helper.pathToUrl[doc.path];

    if (url.includes("#")) {
      doc.id = helper.pathToUrl[doc.path].split(/#/).pop();
    } else {
      doc.id = doc.name;
    }

    // Add signature information to the doc
    if (needsSignature(doc)) {
      addSignatureParams(doc);
      addSignatureReturns(doc);
      addAttribs(doc);
    }
  });

  // Link doc ancestors & finish up signatures! (after URL generation)
  data().each((doc) => {
    doc.ancestors = getAncestorLinks(doc);

    if (doc.type === "PropertyDoc") {
      addSignatureTypes(doc);
      addAttribs(doc);
    }
  });

  members = helper.getMembers(data);
  // members.tutorials = tutorials.children;

  // output pretty-printed source files by default
  outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false;

  // add template helpers
  /*
  view.find = find;
  view.linkto = linkto;
  view.resolveAuthorLinks = resolveAuthorLinks;
  view.tutoriallink = tutoriallink;
  view.htmlsafe = htmlsafe;
  view.outputSourceFiles = outputSourceFiles; */

  // once for all
  view.nav = buildNav(members);
  // attachModuleSymbols( find({longname: {left: "module:"}}), members.modules );

  // generate the pretty-printed source files first so other pages can link to them
  if (outputSourceFiles) {
    generateSourceFiles(sourceFiles, opts.encoding);
  }

  if (members.globals.length) {
    generate("Global", [{kind: "globalobj"}], globalUrl);
  }

  // index page displays information from package.json and lists files
  const files = docDatabase({kind: "file"}).get();
  const packages = docDatabase({kind: "package"}).get();

  const arr = [];
  generate("Home",
    packages.concat(
      [{
        kind: "mainpage",
        readme: opts.readme,
        longname: (opts.mainpagetitle) ? opts.mainpagetitle : "Main Page",
        children: arr,
        members: arr,
      }],
    ).concat(files), indexUrl);

  const docPaths = SymbolLinks.pathToUrl.keys();
  let docPathEntry = docPaths.next();
  let docPath = docPaths.next().value;

  while (!docPathEntry.done) {
    let doc;

    // Sometimes docPath is undefined!
    if (docPath) {
      doc = findDoc(docPath, docTree);
    }

    if (!doc) {
      console.log(docPath + " doesn't point to a doc");
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

    docPathEntry = docPaths.next();
    docPath = docPathEntry.value;
  }

  /*

  // TODO: move the tutorial functions to templateHelper.js
  function generateTutorial(title, tutorial, filename) {
    const tutorialData = {
      title: title,
      header: tutorial.title,
      content: tutorial.parse(),
      children: tutorial.children,
    };
    const tutorialPath = path.join(outdir, filename);
    let html = view.render("tutorial.tmpl", tutorialData);

    // yes, you can use {@link} in tutorials too!
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

    fs.writeFileSync(tutorialPath, html, "utf8");
  }

  // tutorials can have only one parent so there is no risk for loops
  function saveChildren({children}) {
    children.forEach((child) => {
      generateTutorial(`Tutorial: ${child.title}`, child, helper.tutorialToUrl(child.name));
      saveChildren(child);
    });
  }

  saveChildren(tutorials);*/
};
