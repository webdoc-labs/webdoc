/**
 * Represents a documentation block
 */
export class Doc {
  constructor(options) {
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
    this.localName = options.localName || '';

    /**
     * Child docs
     * @member {Doc[]}
     */
    this.children = [];

    this.rawText = options.rawText || '';
    this.tags = options.tags || [];
    this.parentDoc = options.parentDoc || null;
  }
}
