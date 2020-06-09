const {buildSymbolTree} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc.parser.buildSymbolTree", function() {
  it("should not generate symbols for parameter object properties", function() {
    const symtree = buildSymbolTree(`
      function functionName(paramName) {
        paramName.propertyName = "dataValue";
      }
    `);

    expect(symtree.members.length).to.equal(1);

    const symbolFunctionName = symtree.members[0];

    expect(symbolFunctionName.members.length).to.equal(0);
  });
});
