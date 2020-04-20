// @flow

import {Node} from '@babel/types';
import {Tag} from '../tags/Tag';

export type IDocOptions = {
  node?: Node,
  name?: string,
  tags?: Tag[],
  parentDoc?: Doc,
  rawText?: string
}

/**
 * Represents a documentation block
 */
export class Doc {
  node: Node;
  name: string;
  path: ?string;
  tags: Tag[];

  children: Doc[];
  rawText: string;

  _parentDoc: ?Doc;

  constructor(options: IDocOptions) {
    /**
     * The Babel AST node being described by this doc. This is `null` for
     * inline and standalone docs.
     * @member {Node}
     */
    this.node = options.node || null;

    /**
     * The (local) identifer of the entity being documented.
     * @member {string}
     */
    this.name = options.name || '';

    /**
     * The global identifer of the entity being documented. It is derived from the parent's name.
     * @member {string}
     */
    this.path = null;

    /**
     * Child docs
     * @member {Doc[]}
     */
    this.children = [];

    this.rawText = options.rawText || '';
    this.tags = options.tags || [];
    this.parentDoc = options.parentDoc;
  }

  /**
   * The documentation for the surrounding scope.
   * @member {Doc}
   */
  get parentDoc(): ?Doc {
    return this._parentDoc;
  }
  set parentDoc(doc?: Doc) {
    this._parentDoc = doc;

    if (doc && doc.path) {
      this.path = `${doc.path}.${this.name}`;
    } else {
      this.path = this.name;
    }
  }

  /**
   * Searches for the child named {@code lname}.
   *
   * @param {string} lname
   * @return {Doc} - the child doc
   */
  child(lname: string): ?Doc {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];

      if (child.name === lname) {
        return child;
      }
    }
  }

  addChild(doc: Doc): Doc {
    this.children.push(doc);
    doc.parentDoc = this;

    return doc;
  }
}
