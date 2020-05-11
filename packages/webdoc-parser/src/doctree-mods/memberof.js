"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = memberofResolve;

const _model = require("@webdoc/model");

function queueTargets(doc, into = []) {
  const memberofTag = doc.tags.find((tag) => tag.name === "memberof");

  if (memberofTag) {
    into.push({
      doc,
      destination: memberofTag.value.split("."),
    });
  } else if (doc.parserOpts && doc.parserOpts.memberof != null && typeof doc.parserOpts.memberof !== "undefined") {
    into.push({
      doc,
      destination: doc.parserOpts.memberof,
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
    const scope = (0, _model.doc)(resolve.destination, root);

    if (scope === resolve.doc) {
      console.log(resolve.doc);
      throw new Error("Doc cannot be @memberof of itself");
    }

    if (scope) {
      console.log("Resolving @memberof for " + resolve.doc.name + " to " + scope.name);
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
      console.log(iqueue);
      throw new Error("@memberof dependencies are circular; cannot resolve after " + lastQueueLength);
    }

    lastQueueLength = iqueue.length;
    iqueue = queueResolve(iqueue, root);
  }
}
