"use strict";

const InlineDoc = require('./InlineDoc');

class ParamDoc extends InlineDoc {
  constructor(options) {
    super(options);
    /**
     * The type of the parameter
     * @member {string}
     */

    this.type = '';
    /**
     * The reference to the doc describing the type
     * @member {Doc}
     */

    this.typeRef = null;
  }

}

module.exports = ParamDoc;