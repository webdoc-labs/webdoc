// @flow

import * as fse from "fs-extra";
import type {TemplatePipeline, TemplatePipelineElement} from "../TemplatePipeline";
import path from "path";

type SitemapData = {
  outputFile: string;
};

export class Sitemap implements TemplatePipelineElement<SitemapData> {
  urls: string[] = [];
  dir: string;
  domain: string;
  root: string;

  /**
   * @param {string} dir - Directory to save sitemap.xml
   * @param {string} domain - The site domain with protocol
   * @param {string} root - the siteroot
   */
  constructor(dir: string, domain: string, root: string) {
    this.dir = dir;
    this.domain = domain;
    this.root = root;

    if (this.domain.charAt(this.domain.length - 1) !== "/") {
      this.domain += "/";
    }
  }

  attachTo(pipeline: TemplatePipeline) {
    // noop
  }

  run(input: string, pipelineData: SitemapData = {}): string {
    if (pipelineData.outputFile) {
      this.urls.push(pipelineData.outputFile);
    }

    return input;
  }

  close(): void {
    /* eslint-disable max-len */
    const xml =
`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${this.urls.map((url) =>
    `  <url>
    <loc>${this.domain + path.join(this.root, path.relative(this.dir, url))}</loc>
  </url>`).join("\n")}
</urlset>`;
    /* eslint-enable max-len */

    fse.outputFile(path.join(this.dir, "sitemap.xml"), xml, (err) => {
      if (err) throw err;
    });
  }

  clone(): Sitemap {
    const clone = new Sitemap(this.dir, this.domain, this.root);

    clone.urls = [...this.urls];

    return clone;
  }
}
