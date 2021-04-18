// @flow

import {log, tag} from "missionlog";
import type {Tutorial} from "@webdoc/types";
import {createTutorialDoc} from "@webdoc/model";
import fs from "fs";
import globby from "globby";
import merge from "lodash.merge";
import {morphTutorials} from "./morph-tutorials";
import path from "path";

// Markdown rendering
const renderer = require("markdown-it")({
  breaks: true,
  html: true,
})
  .use(require("markdown-it-highlightjs"));

// Loads & parses all the tutorials in the given directory
export function loadTutorials(tutorialsDir?: string): Tutorial[] {
  if (!tutorialsDir) {
    return [];
  }

  if (!path.isAbsolute(tutorialsDir)) {
    tutorialsDir = path.join(process.cwd(), tutorialsDir);
  }

  const tutorialFiles = globby.sync(path.join(tutorialsDir, "./**/*"));
  const webdocIgnoreExists = fs.existsSync(path.join(tutorialsDir, "./.webdocignore"));
  const webdocIgnorePatterns: $ReadOnlyArray<string> = webdocIgnoreExists ?
    fs.readFileSync(path.join(tutorialsDir, ".webdocignore"), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => !line.startsWith("#")) :
    [];

  if (webdocIgnoreExists) {
    log.info(tag.CLI, "Found .webdocignore in the tutorials directory");
  }

  let tutorialConf = null;
  let tutorials: Tutorial[] = [];

  for (let i = 0; i < tutorialFiles.length; i++) {
    let fileName = tutorialFiles[i];

    const relativePath = path.relative(tutorialsDir, fileName);

    // Really simple check to ignore files using .webdocignore (undocumented feature)
    if (webdocIgnorePatterns.some(
      (pattern) => relativePath.startsWith(pattern),
    )) {
      continue;
    }

    if (fileName.endsWith(".json")) {
      const fileJSON = JSON.parse(fs.readFileSync(fileName, "utf8"));

      tutorialConf = merge(tutorialConf || {}, fileJSON);
      log.info(tag.CLI, "Found tutorial configuration: " + relativePath);

      continue;
    }

    if (!fileName.endsWith(".html") && !fileName.endsWith(".htm") && !fileName.endsWith(".md")) {
      continue;
    }
    log.info(tag.CLI, "Found tutorial " + relativePath);

    let fileContent = fs.readFileSync(fileName, "utf8");

    if (fileName.endsWith(".md")) {
      fileContent = renderer.render(fileContent);
    }

    fileName = path.basename(fileName);
    fileName = fileName.slice(0, fileName.lastIndexOf("."));

    // Tutorials can be part of the doc-tree!
    tutorials.push(createTutorialDoc(
      fileName,
      path.join('tutorials', relativePath
        .replace(".html", "")
        .replace(".htm", "")
        .replace(".md", "")),
      fileContent,
    ));
  }

  if (tutorialConf) {
    tutorials = morphTutorials(tutorials, tutorialConf);
  }

  return tutorials;
}
