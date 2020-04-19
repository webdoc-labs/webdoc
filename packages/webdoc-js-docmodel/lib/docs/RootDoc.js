"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RootDoc = void 0;

var _Doc = require("./Doc");

/**
 * Provides a single doc at the top of the doc-tree for program entry.
 */
class RootDoc extends _Doc.Doc {
  constructor() {
    super({
      localName: 'PROGRAM'
    });
  }

}

exports.RootDoc = RootDoc;