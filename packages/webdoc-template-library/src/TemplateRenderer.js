// @flow
import * as _ from "lodash";
import type {
  Doc,
  MethodDoc,
  RootDoc,
} from "@webdoc/types";
import {tag, templateLogger} from "./Logger";
import {SymbolLinks} from "./SymbolLinks";
import fs from "fs";
import path from "path";

let printedDefaultLinker = false;

// No idea what ESLint is thinking in the following doc.
/* eslint-disable valid-jsdoc */
/**
 * The template renderer uses lodash to parse .tmpl template files and renders HTML content. A
 * template file contains {@code <?js js>} delimiters containing JavaScript code to control
 * what gets rendered. See {@npm @webdoc/template-library} for an example.
 *
 * The {@code this} context for template code is always the {@code TemplateRenderer}. This allows
 * you to access the API provided by the generator in your template files.
 *
 * The {@code getNamespaces}, {@code getClasses}, {@code getProperties}, {@code getMethods},
 * {@code getFunctions}, {@code getConstructor}, {@code getEvents}, {@code getTypedefs},
 * {@code getMixins}, {@code getInterfaces} methods were made for use in templates!
 */
/* eslint-enable valid-jsdoc */
export class TemplateRenderer {
  templateDir: string;
  docDatabase: any;
  docTree: RootDoc;
  layout: any;
  cache: { [id: string]: any };
  data: any;
  settings: { evaluate: RegExp, interpolate: RegExp, escape: RegExp };
  plugins: { [id: string]: Object };

  /**
   * @param {string} templateDir - Templates directory.
   * @param {any} docDatabase - database of documented symbols ({@code Doc}s)
   * @param {RootDoc} [docTree]
   */
  constructor(templateDir: string, docDatabase: any, docTree: RootDoc) {
    this.templateDir = templateDir;
    this.docDatabase = docDatabase;
    this.docTree = docTree;
    this.layout = null;

    /**
     * Extra data you can provide so that template files can access it
     * @type {object}
     */
    this.data = {};

    this.cache = {};
    this.plugins = {};

    // override default template tag settings
    this.settings = {
      evaluate: /<\?js([\s\S]+?)\?>/g,
      interpolate: /<\?js=([\s\S]+?)\?>/g,
      escape: /<\?js~([\s\S]+?)\?>/g,
    };
  }

  setLayoutTemplate(templateFile: string) /*: TemplateRenderer */ {
    this.layout = templateFile;
    return this;
  }

  getPlugin<T>(pluginName: string): T {
    return this.plugins[pluginName];
  }

  /**
   * Install a plugin to this renderer. It can be accessed at `renderer.plugins[name]`.
   *
   * @param {string} name
   * @param {Object} plugin
   * @return {TemplateRenderer} this
   */
  installPlugin(name: string, plugin: Object): TemplateRenderer {
    if (typeof plugin === "function") {
      this.plugins[name] = plugin;
      this.plugins[name].renderer = this;

      return this;
    }

    if (plugin.bindingPolicy === "complete") {
      this.plugins[name] = plugin;

      plugin.onBind(this);
    } else {
      this.plugins[name] = this.plugins[name] || {};

      Object.assign(this.plugins[name], plugin);
      this.plugins[name].renderer = this;
    }

    return this;
  }

  linkTo(...args: any[]) {
    if (!printedDefaultLinker) {
      console.warn("The default linker is the deprecated SymbolLinks API. " +
        "Upgrade to the LinkerPlugin!");
      printedDefaultLinker = true;

      // $FlowFixMe
      this.linkTo = SymbolLinks.linkTo;
    }

    return SymbolLinks.linkTo(...args);
  }

  find(spec: any) {
    return this.docDatabase(spec).get();
  }

  /**
   * Loads template from given file.
   *
   * @param {string} filePath - Template filename.
   * @return {function} Returns template closure.
   */
  load(filePath: string) {
    templateLogger.info(tag.TemplateLibrary, `Loading template ${filePath}`);
    return _.template(fs.readFileSync(filePath, "utf8"), this.settings);
  }

  /**
   * Renders template using given data.
   *
   * This is low-level function, for rendering full templates use {@link TemplateGenerator#render}.
   *
   * @protected
   * @param {string} filePath - Template filename.
   * @param {object} data - Template variables (doesn't have to be object, but passing variables
   * dictionary is best way and most common use).
   * @return {string} Rendered template.
   */
  partial(filePath: string, data: string) {
    filePath = path.resolve(this.templateDir, filePath);

    // load template into cache
    if (!(filePath in this.cache)) {
      this.cache[filePath] = this.load(filePath);
    }

    // keep template helper context
    templateLogger.info(tag.TemplateLibrary, `Partial() template ${filePath} ${data}`);

    let docHTML;

    try {
      docHTML = this.cache[filePath].call(this, data);
    } catch (e) {
      console.error(`Rendering template: ${filePath}`);
      console.error(this.cache[filePath].source);
      throw e;
    }

    return docHTML;
  }

  /**
   * Renders template with given data.
   *
   * This method automaticaly applies layout if set.
   *
   * @param {string} filePath - file path of the template
   * @param {object} data - dictionary of all the variables & their values used in the template
   * @return {string} Rendered template.
   */
  render(filePath: string, data: any) {
    // main content
    templateLogger.info(tag.TemplateLibrary, `Requested template ${filePath} ${data}`);

    let content = this.partial(filePath, data);

    templateLogger.info(tag.TemplateLibrary, `Rendering() template ${filePath} ${data}`);

    // apply layout
    if (this.layout) {
      data.content = content;
      templateLogger.info(tag.TemplateLibrary, `Request layout ${filePath} ${data}`);
      content = this.partial(this.layout, data);
    }

    templateLogger.info(tag.TemplateLibrary, `Rendering2 template ${filePath} ${data}`);

    return content;
  }

  htmlText = (str /*: string */) /*: string */ => {
    if (typeof str !== "string") {
      str = String(str);
    }

    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  };

  /**
   * Finds all the members namespaces of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find namespaces recursively
   * @param {Doc[]}[out] - optional array to output the namespace-docs into
   * @return {NSDoc[]}
   */
  getNamespaces(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "NSDoc", recursive, out);
  }

  /**
   * Finds all the member classes of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find classes recursively
   * @param {Doc[]}[out] - optional array to output the classes-docs into
   * @return {ClassDoc[]}
   */
  getClasses(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "ClassDoc", recursive, out);
  }

  /**
   * Finds all the member enums of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find classes recursively
   * @param {Doc[]}[out] - optional array to output the classes-docs into
   * @return {EnumDoc[]}
   */
  getEnums(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "EnumDoc", recursive, out);
  }

  /**
   * Finds all the member methods of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find methods recursively
   * @param {Doc[]}[out] - optional array to output the method-docs into
   * @return {MethodDoc[]}
   */
  getMethods(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    // Can't use getMembers because "constructor" is a special MethodDoc that isn't included!

    if (!out) {
      out = [];
    }

    for (let i = 0; i < doc.members.length; i++) {
      if (doc.members[i].type === "MethodDoc" && doc.members[i].name !== "constructor" &&
          doc.members[i].access !== "private") {
        out.push(doc.members[i]);
      }
    }

    if (recursive) {
      for (let i = 0; i < doc.members.length; i++) {
        if (doc.members[i].access !== "private") {
          this.getMethods(doc.members[i], true, out);
        }
      }
    }

    return out;
  }

  /**
   * Finds all the member functions of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find classes recursively
   * @param {Doc[]}[out] - optional array to output the classes-docs into
   * @return {FunctionDoc[]}
   */
  getFunctions(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "FunctionDoc", recursive, out);
  }

  /**
   * Finds all the member functions & methods of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find classes recursively
   * @param {Doc[]}[out] - optional array to output the classes-docs into
   * @return {(MethodDoc | FunctionDoc)[]}
   */
  getMethodLikes(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    if (!out) {
      out = [];
    }

    for (let i = 0; i < doc.members.length; i++) {
      const member = doc.members[i];

      if ((member.type === "FunctionDoc" || member.type === "MethodDoc") &&
          doc.members[i].access !== "private" &&
          doc.members[i].name !== "constructor") {
        out.push(doc.members[i]);
      }
    }

    if (recursive) {
      for (let i = 0; i < doc.members.length; i++) {
        // Don't search inside private docs
        if (doc.members[i].access !== "private") {
          this.getMethodLikes(doc.members[i], true, out);
        }
      }
    }

    return out;
  }

  /**
   * Finds a (member) constructor for {@code doc}. This should be used only on a {@code ClassDoc}.
   *
   * @param {Doc} doc
   * @return {MethodDoc}
   */
  getConstructor(doc: Doc): ?MethodDoc {
    return (doc.members.find(
      (member) => member.type === "MethodDoc" && member.name === "constructor"): any);
  }

  /**
   * Finds all the events of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find events recursively
   * @param {Doc[]}[out] - optional array to output the event-docs into
   * @return {EventDoc[]}
   */
  getEvents(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "EventDoc", recursive, out);
  }

  /**
   * Finds all the properties of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find events recursively
   * @param {Doc[]}[out] - optional array to output the event-docs into
   * @return {PropertyDoc[]}
   */
  getProperties(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "PropertyDoc", recursive, out);
  }

  /**
   * Finds all the member typedefs of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find typedefs recursively
   * @param {Doc[]}[out] - optional array to output the typedef-docs into
   * @return {Typedef[]}
   */
  getTypedefs(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "TypedefDoc", recursive, out);
  }

  /**
   * Finds all the member classes of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find mixins recursively
   * @param {Doc[]}[out] - optional array to output the mixin-docs into
   * @return {MixinDoc[]}
   */
  getMixins(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "MixinDoc", recursive, out);
  }

  /**
   * Finds all the member interfaces of {@code doc}.
   *
   * @param {Doc} doc
   * @param {boolean}[recursive=false] - whether to find interfaces recursively
   * @param {Doc[]}[out] - optional array to output the interface-docs into
   * @return {InterfaceDoc[]}
   */
  getInterfaces(doc: Doc, recursive: boolean = false, out: Doc[]): Doc[] {
    return this.getMembers(doc, "InterfaceDoc", recursive, out);
  }

  /**
   * Finds all the members of {@code doc} of the type {@code type}.
   *
   * @private
   * @param {Doc} doc - the doc to find members of
   * @param {string} type - the type of member to find
   * @param {boolean}[recursive=false] - whether to recursively find members of members and so on
   * @param {Doc[]}[out] - optional array to push the members into
   * @return {Doc[]}
   */
  getMembers(doc: Doc, type: string, recursive: boolean = false, out?: Doc[]): Doc[] {
    if (!out) {
      out = [];
    }

    for (let i = 0; i < doc.members.length; i++) {
      if (doc.members[i].type === type && doc.members[i].access !== "private") {
        out.push(doc.members[i]);
      }
    }

    if (recursive) {
      for (let i = 0; i < doc.members.length; i++) {
        // Don't search inside private docs
        if (doc.members[i].access !== "private") {
          this.getMembers(doc, type, true, out);
        }
      }
    }

    return out;
  }
}
