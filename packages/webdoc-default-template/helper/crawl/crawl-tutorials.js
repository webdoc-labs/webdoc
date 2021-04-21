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

  let rootTarget = {
    children: {},
  };

  for (const tutorial of docTree.tutorials) {
    buildTutorialTargets(tutorial, rootTarget);
  }

  // No need for single top-level item
  if (Object.keys(rootTarget.children).length === 1) {
    const implicitRootTarget = rootTarget.children[Object.keys(rootTarget.children)[0]];

    rootTarget = {
      page: implicitRootTarget.page,
      children: implicitRootTarget.children,
    };
  }

  return rootTarget;
}

function buildTutorialTargets(
  tutorial /*: TutorialDoc */,
  parent /*: ExplorerTarget */,
)/*: ExplorerTarget */ {
  const tutorialTarget = {
    title: tutorial.title,
    page: tutorial.route ? linker.getURI(tutorial) : null,
    children: {},
  };

  parent.children[tutorialTarget.title] = tutorialTarget;

  if (tutorial.members.length > 0) {
    if (tutorialTarget.page) {
      tutorialTarget.children.overview = {
        title: "(overview)",
        page: tutorialTarget.page,
      };
    }

    for (const childTutorial of tutorial.members) {
      if (childTutorial.type === "TutorialDoc") {
        buildTutorialTargets(childTutorial, tutorialTarget);
      }
    }
  }

  return tutorialTarget;
}

exports.crawlTutorials = crawlTutorials;
