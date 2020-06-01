// @flow

import type {TemplatePipelineElement} from "../TemplatePipelineElement";
import {SymbolLinks} from "./SymbolLinks";

const LINK_PATTERN = /{@link ([^}]*)}/g;

/**
 * Resolves the following types of tags:
 *
 * + {@link [<URL> | <DocPath>]} - replaces it with a link-element to the URL or document
 * + TODO: {@code [<CODE>]}
 */
export class TemplateTagsResolver implements TemplatePipelineElement<{}> {
  linkClass: ?string;

  /**
   * @param {object} options
   * @param {string}[options.linkClass] - CSS class for the link elements generated
   */
  constructor(options?: { linkClass?: string } = {}) {
    this.linkClass = options.linkClass;
  }

  run(input: string, pipelineData: any): string {
    input = this.runLink(input);

    return input;
  }

  runLink(input: string, _: {}): string {
    const linkPattern = LINK_PATTERN;
    let linkMatch;

    while ((linkMatch = linkPattern.exec(input)) !== null) {
      const link = linkMatch[1];
      let replaced;

      if (isValidUrl(link)) {
        replaced = `<a ${this.linkClass ? "class=\"" + this.linkClass + "\"" : ""}
          href="${link}">${link}</a>`;
      } else {
        replaced = SymbolLinks.linkTo(link, link);
      }

      input = input.slice(0, linkMatch.index) + replaced + input.slice(linkMatch.index);
    }

    return input;
  }

  clone() {
    return new TemplateTagsResolver({
      linkClass: this.linkClass,
    });
  }
}

// Helper function to check if link content is just a URL
function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
}
