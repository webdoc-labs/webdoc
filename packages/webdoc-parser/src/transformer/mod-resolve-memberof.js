// @flow
/* eslint-disable */

"use strict";

import {CANONICAL_DELIMITER} from "../constants";
import type {Doc} from "@webdoc/types";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = memberofResolve;

const _model = require("@webdoc/model");
import {doc as findDoc} from "@webdoc/model";

function queueTargets(doc, into = []) {
  const memberofTag = doc.tags.find((tag) => tag.name === "memberof");

  if (doc.parserOpts && doc.parserOpts.memberof != null && typeof doc.parserOpts.memberof !== "undefined") {
    into.push({
      doc,
      destination: doc.parserOpts.memberof,
    });
  } else if (memberofTag) {
    let memberof = memberofTag.value;

    if (memberof.endsWith("#")) {
      doc.scope = "instance";
      memberof = memberof.slice(0, -1);
    } else if (memberof.endsWith(".")) {
      doc.scope = "static";
      memberof = memberof.slice(0, -1);
    } else if (memberof.endsWith("~")) {
      doc.scope = "inner";
      memberof = memberof.slice(0, -1);
    }

    into.push({
      doc,
      destination: memberof.split(CANONICAL_DELIMITER).filter((ch) => ch !== "." && ch !== "~" && ch !== "#"),
    });
  }

  for (let i = 0; i < doc.children.length; i++) {
    queueTargets(doc.children[i], into);
  }

  return into;
}

function queueResolve(queue, root) {
  const backlog = [];

  while (queue.length) {
    const resolve = queue.shift();
    const scope = findDoc(resolve.destination, root);

    if (scope === resolve.doc) {
      console.log(resolve.doc);
      throw new Error("Doc cannot be @memberof of itself");
    }

    if (scope) {
      (0, _model.addChildDoc)(resolve.doc, scope);
    } else {
      backlog.push(resolve);
    }
  }

  return backlog;
}

function memberofResolve(doc, root) {
  let iqueue = queueTargets(root);
  let lastQueueLength = iqueue.length + 1;

  while (iqueue.length) {
    if (iqueue.length === lastQueueLength) {
      throwCircularDepsError(iqueue, root);
    }

    lastQueueLength = iqueue.length;
    iqueue = queueResolve(iqueue, root);
  }
}

function throwCircularDepsError(queue: Doc[], root: RootDoc): void {
  for (let i = 0; i < queue.length; i++) {
    const doc = queue[i].doc;
    const destination = queue[i].destination;

    console.error(`[DepsChain]: ${doc.name} (@${doc.path})[${doc.type}] is a member of ${destination}`);
  }

  throw new Error("@memberof dependencies are circular; cannot resolve after " + queue.length + " deps are left");
}
