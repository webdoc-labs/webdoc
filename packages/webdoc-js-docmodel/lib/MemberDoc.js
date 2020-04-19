"use strict";

const Doc = require('./Doc');

class MemberDoc extends Doc {
  constructor(options) {
    super(options);
    /**
     * @member {ParamDoc[]}
     */

    this.paramDocs = [];
  }

}

module.exports = MemberDoc;