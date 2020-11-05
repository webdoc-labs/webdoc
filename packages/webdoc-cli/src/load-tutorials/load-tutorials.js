// @flow

import type {Tutorial} from "@webdoc/types";
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

  const tutorialFiles = globby.sync(path.join(tutorialsDir, "./**/*"));
  let tutorialConf = null;
  let tutorials = [];

  for (let i = 0; i < tutorialFiles.length; i++) {
    let fileName = tutorialFiles[i];

    if (fileName.endsWith(".json")) {
      const fileJSON = JSON.parse(fs.readFileSync(fileName, "utf8"));

      tutorialConf = merge(tutorialConf || {}, fileJSON);
      continue;
    }

    if (!fileName.endsWith(".html") && !fileName.endsWith(".htm") && !fileName.endsWith(".md")) {
      continue;
    }

    let fileContent = fs.readFileSync(fileName, "utf8");

    if (fileName.endsWith(".md")) {
      fileContent = renderer.render(fileContent);
    }

    fileName = path.basename(fileName);
    fileName = fileName.slice(0, fileName.lastIndexOf("."));

    // Tutorials can be part of the doc-tree!
    tutorials.push({
      name: fileName,
      path: fileName,
      stack: [fileName],
      title: fileName,
      content: fileContent,
      members: [],
      type: "TutorialDoc",
    });
  }

  if (tutorialConf) {
    tutorials = morphTutorials(tutorials, tutorialConf);
  }

  return tutorials;
}

function buildTutorialTree(config, tutorials) {
  const nameToTutorial = new Map();

  tutorials.forEach((t) => nameToTutorial.set(t.name, t));
}
