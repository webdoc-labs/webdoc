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

  it("should redirect prototype-assigned properties as instance properties", function() {
    const symtree = buildSymbolTree(`
      ClassName.prototype.propertyName = "dataValue";
    `);

    expect(symtree.members[0].meta.scope).to.equal("instance");
    expect(symtree.members[0].meta.object).to.equal("ClassName");
  });
});
