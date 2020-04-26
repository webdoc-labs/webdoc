"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prune;

var _model = require("@webdoc/model");

function prune(doc, root) {
  if (doc.tags.find(tag => tag.name === "prune")) {
    (0, _model.removeChildDoc)(doc);
  } else {
    for (let i = 0; i < doc.children.length; i++) {
      prune(doc.children[i], root);
    }
  }
}