"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = memberResolve;

var _model = require("@webdoc/model");

function bubbleThis(doc) {
  if (doc.type === "ClassDoc" || doc.type === "ObjectDoc") {
    return doc;
  }

  if (!doc.parent) {
    return null;
  }

  return bubbleThis(doc.parent);
}

function resolvedThis(doc) {
  return doc.scope === "this" && (doc.parent.type === "ClassDoc" || doc.parent.type === "ObjectDoc");
}

function memberResolve(doc, root) {
  if (doc.type === "PropertyDoc" && doc.scope !== doc.parent.name && !resolvedThis(doc) && doc.scope) {
    const scope = doc.scope === "this" ? bubbleThis(doc) : (0, _model.doc)(doc.scope, root);

    if (scope) {
      console.log(doc.name + " parent" + " " + scope.name);
      (0, _model.addChildDoc)(doc, scope);
      return;
    } else {
      console.warn(`Member ${doc.path} could not be resolved to ${doc.scope}`);
    }
  }

  for (let i = 0; i < doc.children.length; i++) {
    memberResolve(doc.children[i], root);
  }
}