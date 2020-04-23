// @flow
import type {Doc, RootDoc, Tag} from "@webdoc/types";
import {doc as findDoc, addChildDoc} from "@webdoc/model";

// Used to queue all Docs with a @memberof tag
type ResolveTarget = {
  doc: Doc,
  destination: string[]
};

function queueTargets(doc: Doc, into: ResolveTarget[] = []): ResolveTarget[] {
  const memberofTag: Tag = doc.tags.find((tag) => tag.name === "memberof");

  if (memberofTag) {
    into.push({
      doc,
      destination: memberofTag.value.split("."),
    });
  }

  for (let i = 0; i < doc.children.length; i++) {
    queueTargets(doc.children[i], into);
  }

  return into;
}

function queueResolve(queue: ResolveTarget[], root: RootDoc): ResolveTarget[] {
  const backlog = [];

  while (queue.length) {
    const resolve = queue.shift();
    const scope = findDoc(resolve.destination, root);

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
      throw new Error(
        "@memberof dependencies are circular; cannot resolve after " + lastQueueLength);
    }

    lastQueueLength = iqueue.length;
    iqueue = queueResolve(iqueue, root);
  }
}
