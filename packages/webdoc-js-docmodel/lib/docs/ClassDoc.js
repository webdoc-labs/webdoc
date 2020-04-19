"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClassDoc = void 0;

var _Doc = require("./Doc");

class ClassDoc extends _Doc.Doc {
  constructor(options) {
    super(options);
    /**
     * @member {MemberDoc[]}
     */

    this.members = [];
    /**
     * @member {MethodDoc[]}
     */

    this.methods = [];
    /**
     * @member {PropDoc[]}
     */

    this.props = [];
  }

}

exports.ClassDoc = ClassDoc;