// @flow

import {type Doc} from '../docs/Doc';

export type ITagOptions = {
  name: string,
  value?: string,
  doc?: Doc;
};

export class Tag {
  name: string;
  value: string;

  doc: ?Doc;

  constructor(options: ITagOptions) {
    this.name = options.name;
    this.value = options.value || '';
    this.doc = options.doc;
  }

  static parse(name: string, value: string) {
    return new Tag({name, value});
  }
}
