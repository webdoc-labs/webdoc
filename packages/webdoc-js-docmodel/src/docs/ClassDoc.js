import {Doc} from './Doc';

export class ClassDoc extends Doc {
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
