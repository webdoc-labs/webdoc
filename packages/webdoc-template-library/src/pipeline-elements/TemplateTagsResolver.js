// @flow

import type {TemplatePipelineElement} from "../TemplatePipelineElement";
import {SymbolLinks} from "../SymbolLinks";

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
      const linkTextMatch = matchTextPrefix(input, linkMatch.index);

      const parts = linkMatch[1].split(/\s*?[|\s]\s*?/);
      const link = parts[0];
      const linkName = parts[1];
      const linkText = linkTextMatch ? linkTextMatch[0].slice(1, -1) : (linkName || link);

      let replaced;

      if (isValidUrl(link)) {
        replaced = `<a ${this.linkClass ? "class=\"" + this.linkClass + "\"" : ""}` +
        `href="${link}">${linkText}</a>`;
      } else {
        replaced = SymbolLinks.linkTo(link, linkText);
      }

      const startIndex = linkTextMatch ? linkTextMatch.index : linkMatch.index;
      const endIndex = linkMatch.index + linkMatch[0].length;

      input =
        input.slice(0, startIndex) +
        replaced +
        input.slice(endIndex);
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

// Match the [TEXT_PREFIX] before a {@inline-tag ...}
function matchTextPrefix(content: string, tagStart: number): ?([string] & {index: number}) {
  const index = tagStart - 1;

  if (content.charAt(index) !== "]") {
    return;
  }

  // Allow nested bracket closures in the TEXT_PREFIX, e.g. TEXT_PREFIX[] is valid
  // This is the no. of closing brackets we are in
  // _] = 1
  // _[]] = 1
  let bracketDepth = 1; // (1 because we include the "]" at "index")

  // Index at which last opening bracket is found
  let openIndex = -1;

  for (let i = index - 1; i >= 0; i--) {
    const char = content.charAt(i);

    if (char === "[") {
      --bracketDepth;

      if (bracketDepth === 0) {
        openIndex = i;
        break;
      }
    } else if (char === "]") {
      ++bracketDepth;
    }
  }

  if (openIndex === -1) {
    return;
  }

  const result = [content.slice(openIndex, index + 1)];

  result.index = openIndex;

  return result;
}
