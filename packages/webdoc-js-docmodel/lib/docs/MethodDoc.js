"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MethodDoc = void 0;

var _Doc = require("./Doc");

class MethodDoc extends _Doc.Doc {
  constructor(options) {
    super(options);
    /**
     * @member {ParamDoc[]}
     */

    this.paramDocs = [];
  }

}

exports.MethodDoc = MethodDoc;