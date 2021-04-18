// @flow

const {linker} = require("../linker");

/*::
 import type {
   Doc,
   RootDoc,
   TutorialDoc,
 } from "@webdoc/types";

 import type { ExplorerTarget } from './crawl-reference-explorer';
 */

// Build a explorer tree for tutorials
function crawlTutorials(docTree /*: RootDoc */)/*: ?ExplorerTarget */ {
  if (!docTree.tutorials.length) {
    return null;
  }

  const rootTarget = {
    title: "Tutorials",
    page: linker.createURI("tutorials/index.html"),
    children: {},
  };

  for (const tutorial of docTree.tutorials) {
    buildTutorialTargets(tutorial, rootTarget);
  }

  return rootTarget;
}

function buildTutorialTargets(
  tutorial /*: TutorialDoc */,
  parent /*: ExplorerTarget */,
)/*: ExplorerTarget */ {
  const tutorialTarget = {
    title: tutorial.title,
    page: linker.createURI(tutorial.route),
    children: {},
  };

  parent.title = tutorialTarget;
  parent.children[tutorialTarget.title] = tutorialTarget;

  for (const childTutorial of tutorial.members) {
    if (childTutorial.type === "TutorialDoc") {
      buildTutorialTargets(childTutorial, tutorialTarget);
    }
  }

  return tutorialTarget;
}

exports.crawlTutorials = crawlTutorials;
