"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = memberResolve;

const _model = require("@webdoc/model");

function bubbleThis(doc) {
  if (doc.type === "ClassDoc" || doc.type === "ObjectDoc" || doc.type === "MixinDoc" || doc.type === "InterfaceDoc") {
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
  if (doc.path !== (doc.parent ? `${doc.parent.name}.${doc.name}` : doc.name) && !resolvedThis(doc) && doc.object) {
    const scope = doc.object === "this" ? bubbleThis(doc) : (0, _model.doc)(doc.object, root);

    if (scope) {
      (0, _model.addChildDoc)(doc, scope);
      return;
    } else {
      console.warn(`Member ${doc.path} could not be resolved to ${doc.object}`);
    }
  }

  for (let i = 0; i < doc.children.length; i++) {
    memberResolve(doc.children[i], root);
  }
}
