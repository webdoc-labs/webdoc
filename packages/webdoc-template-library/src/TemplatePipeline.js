// @flow
import {TemplateRenderer} from "./TemplateRenderer";

/**
 * A template-pipeline element modifies the generated HTML and returns the result, if any. It
 * can be used with {@code TemplatePipleline}.
 */
export interface TemplatePipelineElement<T> {
  /**
   * This is called when the user pipes this element using {@code TemplatePipeline.pipe}.
   *
   * @param {TemplatePipeline} pipeline
   */
  attachTo: (pipeline: TemplatePipeline) => void;

  /**
   * Runs any modification to the HTML and returns the result.
   *
   * @param {string} input
   * @param {T} pipelineData - the passed pipeline-data to {@code TemplatePipeline.render}
   * @return {string} - the modified HTML. If nothing is returned, the pipeline is halted.
   */
  run(input: string, pipelineData: T): ?string;

  /**
   * Clones the element, less any pipeline-related state.
   */
  clone(): TemplatePipelineElement<T>;
}

/**
 * {@code TemplatePipeline} can be used to modify template-generated HTML or run tasks related
 * to template rendering (like writing HTML to a file).
 */
export class TemplatePipeline {
  renderer: TemplateRenderer;
  elements: Array<TemplatePipelineElement>;

  /**
   * @param {TemplateRenderer} renderer
   */
  constructor(renderer: TemplateRenderer) {
    this.renderer = renderer;
    this.elements = [];
  }

  /**
   * Renders the template {@code templateFile} and runs the output through the pipeline.
   *
   * @param {string} templateFile - template file to render
   * @param {any} templateData - data for the template file
   * @param {any} pipelineData - data for the pipeline elements
   * @return {?string}
   */
  render(templateFile: string, templateData: any, pipelineData: any): ?string {
    let output = this.renderer.render(templateFile, templateData);

    for (let i = 0; i < this.elements.length; i++) {
      output = this.elements[i].run(output, pipelineData);

      if (!output) {
        return;
      }
    }

    return output;
  }

  /**
   * Adds the pipeline-element to run after the last pipeline element.
   *
   * Its input will be the output of the last element, if one exists; otherwise, it will run on the
   * template-generated HTML directly.
   *
   * @param {TemplatePipelineElement} element
   * @return {TemplatePipeline} this
   * @example
   * pipeline
   *    .pipe(new TemplateTagsResolver())
   *    .pipe(new FlushToFile())
   */
  pipe(element: TemplatePipelineElement): TemplatePipeline {
    this.elements.push(element);

    if (element.attachTo) {
      element.attachTo(this);
    }

    return this;
  }
}
