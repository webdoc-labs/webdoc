// @flow

import type {Doc, RootDoc} from "@webdoc/types";
import {addChildDoc, doc as findDoc} from "@webdoc/model";
import {CANONICAL_DELIMITER} from "../constants";

type PendingResolve = {
  doc: Doc,
  destination: string[],
};

function queueTargets(doc: Doc, into: Array<PendingResolve> = []): Array<PendingResolve> {
  const memberofTag = doc.tags ? doc.tags.find((tag) => tag.name === "memberof") : null;

  if (doc.parserOpts &&
      doc.parserOpts.memberof != null &&
      typeof doc.parserOpts.memberof !== "undefined"
  ) {
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
      destination: memberof
        .split(CANONICAL_DELIMITER)
        .filter((ch) => ch !== "." && ch !== "~" && ch !== "#"),
    });
  }

  for (let i = 0; i < doc.members.length; i++) {
    queueTargets(doc.members[i], into);
  }

  return into;
}

function queueResolve(queue: Array<PendingResolve>, root: RootDoc): Array<PendingResolve> {
  const backlog = [];

  while (queue.length) {
    const resolve = queue.shift();
    const scope = findDoc(resolve.destination, root);

    if (scope === resolve.doc) {
      console.log(resolve.doc);
      throw new Error("Doc cannot be @memberof of itself");
    }

    if (scope) {
      addChildDoc(resolve.doc, scope);
    } else {
      backlog.push(resolve);
    }
  }

  return backlog;
}

export default function memberofResolve(doc: Doc, root: RootDoc): void {
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

function throwCircularDepsError(queue: PendingResolve[], root: RootDoc): void {
  for (let i = 0; i < queue.length; i++) {
    const doc = queue[i].doc;
    const destination = queue[i].destination.join(".");

    console.error(
      `[DepsChain]: ${doc.name} (@${doc.path})[${doc.type}] is a member of ${destination}`);
  }

  throw new Error(
    "@memberof dependencies are circular; cannot resolve after " + queue.length + " deps are left");
}
