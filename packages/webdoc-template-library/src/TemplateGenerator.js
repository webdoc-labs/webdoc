// @flow
import * as _ from "lodash";
import fs from "fs";
import path from "path";
import {templateLogger, tag} from "./Logger";

/**
 * The template generator uses lodash to parse .tmpl template files and renders HTML content. A
 * template file contains {@code <?js js>} delimiters containing JavaScript code to control
 * what gets rendered. See {@npm @webdoc/template-library} for an example.
 *
 * The {@code this} context for template code is always the template generator. This allows you
 * to access the API provided by the generator in your template files.
 */
export class TemplateGenerator {
  templateDir: string;
  docDatabase: any;
  layout: any;
  cache: { [id: string]: any };
  settings: { evaluate: RegExp, interpolate: RegExp, escape: RegExp };

  /**
   * @param {string} templateDir - Templates directory.
   * @param {any} docDatabase - database of documented symbols ({@code Doc}s)
   */
  constructor(templateDir: string, docDatabase: any) {
    this.templateDir = templateDir;
    this.docDatabase = docDatabase;
    this.layout = null;
    this.cache = {};

    // override default template tag settings
    this.settings = {
      evaluate: /<\?js([\s\S]+?)\?>/g,
      interpolate: /<\?js=([\s\S]+?)\?>/g,
      escape: /<\?js~([\s\S]+?)\?>/g,
    };
  }

  find(spec: any) {
    return this.docDatabase(spec).get();
  }

  /**
   * Loads template from given file.
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
    return this.cache[filePath].call(this, data);
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
}
