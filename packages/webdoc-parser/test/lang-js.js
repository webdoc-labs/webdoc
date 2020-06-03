const {buildSymbolTree} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.LanguageIntegration{@lang js}", function() {
  it("should parse classes correctly", function() {
    const symtree = buildSymbolTree(`
      class ClassName {
        constructor() { }

        classMethod() { }
        get classProperty() { return 0; }
        set classProperty(val) { }

        static staticMethod() { }
        get staticProperty() { return 0; }
        set staticProperty(val) { }
      }
    `);

    expect(symtree.members.length).to.equal(1);

    const symClassName = symtree.members[0];

    expect(symClassName.members.length).to.equal(5);
  });
});
