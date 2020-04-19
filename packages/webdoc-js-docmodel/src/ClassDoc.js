const Doc = require('./Doc');

class ClassDoc extends Doc {
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

module.exports = ClassDoc;
