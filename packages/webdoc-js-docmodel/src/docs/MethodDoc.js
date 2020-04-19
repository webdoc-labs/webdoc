import {Doc} from './Doc';

export class MethodDoc extends Doc {
  constructor(options) {
    super(options);

    /**
     * @member {ParamDoc[]}
     */
    this.paramDocs = [];
  }
}
