// @flow

import {Doc} from './Doc';

/**
 * Provides a single doc at the top of the doc-tree for program entry.
 */
export class RootDoc extends Doc {
  constructor() {
    super({localName: 'PROGRAM'});

    this.path = '';
  }

  /**
   * Finds the doc whose global path is {@code path}.
   *
   * @param {string} path
   * @param {boolean}[autoCreate=false] - create the docs if they doesn't exist
   * @param {Doc}[Type] - the type of docs created (if autoCreate is used)
   * @return {Doc}
   * @example
   * // Creates namespaces PIXI and PIXI.filters if they don't exist
   * root.doc('PIXI.filters', true, NSDoc);
   *
   * // Returns AbstractBatchRenderer doc only if it exists
   * root.doc('PIXI.AbstractBatchRenderer');
   */
  doc(path: string | string[], autoCreate: boolean = false, Type?: typeof Doc): ?Doc {
    const docStack = Array.isArray(path) ? path : path.split(/[.|#]/);
    let doc = this;

    for (let i = 0; i < docStack.length; i++) {
      let child = doc.child(docStack[i]);

      if (!autoCreate && !child) {
        return null;
      } else if (!child) {
        child = doc.addChild(new (Type: any)({}));
      }

      doc = child;
    }

    return doc;
  }
}
