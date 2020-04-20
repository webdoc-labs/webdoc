// @flow

import {Doc, type IDocOptions} from './Doc';

export type IPropertyDocOptions = {
  ...IDocOptions,
  type: Doc | string;
}

export class PropertyDoc extends Doc {
  type: ?Doc;
  typePath: string

  constructor(options: IPropertyDocOptions) {
    super(options);

    const {type} = options;

    if (typeof type === 'string') {
      this.type = null;
      this.typePath = type;
    } else {
      this.type = type;
      this.typePath = (type.path: any);
    }
  }
}
