import {Doc} from './Doc';

/**
 * Provides a single doc at the top of the doc-tree for program entry.
 */
export class RootDoc extends Doc {
  constructor() {
    super({localName: 'PROGRAM'});
  }
}
