class Doc {
  constructor(options) {
    this.rawText = options.rawText || '';
    this.tags = options.tags || [];
    this.parentDoc = options.parentDoc || null;
    this.name = options.name || '';
  }
}

module.exports = Doc;
