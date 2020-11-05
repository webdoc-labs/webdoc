// @flow

import type {Doc} from "@webdoc/types";
import branch from "git-branch";
import path from "path";
import gh from "parse-github-url";

/**
 * Abstract class that handles linking documented symbols to their source locations in a remote
 * repository. The template library provides integration with these sites:
 * + GitHub
 * + (TODO:) GitLab
 * + (TODO:) BitBucket
 *
 * @abstract
 */
export class RepositoryIntegration {
  /**
   * The URL for this repository
   */
  url: string;

  /**
   * Does any initialization when opening the repository
   * @param {string} url
   */
  constructor(url: string) {
    this.url = url;

    if (!this.url.endsWith("/")) {
      this.url += "/";
    }
  }

  /**
   * Should returns a URL pointing to the documented symbol in the remote repository
   *
   * @param {Doc} doc
   * @param {string}[linkText]
   * @return {string} the source-location URL
   */
  linkTo(doc: Doc, linkText?: string): string {
    const fakeCondition = false;

    if (fakeCondition) {
      return "";
    }

    throw new Error("NotImplementedError");
  }

  /**
   * Should test whether the URL is handled by this integration
   *
   * @param {string} url
   * @return {boolean} whether {@code url} belongs to this integration
   */
  static test(url: string): boolean {
    const fakeCondition = false;

    if (fakeCondition) {
      return false;
    }

    throw new Error("NotImplementedError");
  }
}

const repositoryIntegrations: typeof RepositoryIntegration = [];

/**
 * Auto-detect the repository-integration for the given remote repository URL.
 *
 * @param {string} url
 * @return {RepositoryIntegration}
 */
export function autoDetectRepository(url: string): RepositoryIntegration {
  for (const Integration of repositoryIntegrations) {
    if (Integration.test(url)) {
      return new Integration(url);
    }
  }

  return null;
}

/**
 * Install a custom repository-integration
 *
 * @param {Class<RepositoryIntegration>} integration - the class of your integration
 */
export function installRepository(integration: typeof RepositoryIntegration): void {
  repositoryIntegrations.unshift(integration);
}

// GitHub repository-integration
class GitHubIntegration extends RepositoryIntegration {
  constructor(url: string) {
    super(url);

    // NOTE: this.url always has a slash at the end
    const urlInfo = gh(this.url);
    const currentBranch = branch.sync();

    if (currentBranch) {
      if (typeof urlInfo.blob === "undefined") {
        this.url += `blob/${currentBranch}/`;
      } else if (urlInfo.branch) {
        this.url = this.url.replace(urlInfo.branch, currentBranch);
      }
    } else if (!urlInfo.branch) {
      console.error("GitHubIntegration unable to resolve branch in " + this.url);
    }
  }

  linkTo(doc: Doc, linkText?: string): string {
    if (!doc.loc) {
      return;
    }

    let fileName = doc.loc.fileName;

    if (fileName.startsWith("./")) {
      fileName = fileName.replace("./", "");
    }

    let sourceFile = `${this.url}${fileName}`;
    let defaultText = `${path.basename(fileName)}`;

    if (doc.loc.start) {
      sourceFile += `#L${doc.loc.start.line}`;
      defaultText += `:${doc.loc.start.line}`;
    }

    return `<a href=${sourceFile}>${linkText || defaultText}</a>`;
  }

  static test(url: string): boolean {
    return url.includes("github.com");
  }
}

installRepository(GitHubIntegration);
