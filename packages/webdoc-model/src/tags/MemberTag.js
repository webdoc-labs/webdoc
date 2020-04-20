// @flow

import {Tag, type ITagOptions} from './Tag';

type IMemberTagOptions = {
  ...ITagOptions,
  typePath?: string
}

export class MemberTag extends Tag {
  typePath: ?string;

  constructor(options: IMemberTagOptions) {
    super(options);

    this.typePath = options.typePath;
  }

  static parse(value: string): MemberTag {
    const typePath = value.match(/{([0-9|\w|.|#|\s])+}/);

    return new MemberTag({
      name: 'member',
      value,
      typePath: typePath && typePath[0] ? typePath[0].slice(1, typePath[0].length - 1) : '',
    });
  }
}
