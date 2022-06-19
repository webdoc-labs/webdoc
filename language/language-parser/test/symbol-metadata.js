const {buildSymbolTree} = require("../src/parse");

const expect = require("chai").expect;

describe("@webdoc.parser.buildSymbolTree", function() {
  it("should not generate symbols for parameter object properties", function() {
    const symtree = buildSymbolTree(`
      function functionName(paramName) {
        paramName.propertyName = "dataValue";
      }

      const assignedFunctionName = (param1, param2) => {
        param1.prop1 = "dataValue";
        param2.prop2 = "dataValue";
      }
    `);

    expect(symtree.members.length).to.equal(2);

    const symbolFunctionName = symtree.members[0];

    expect(symbolFunctionName.members.length).to.equal(0);

    const symbolAssignedFunctionName = symtree.members[1];

    expect(symbolAssignedFunctionName.members.length).to.equal(0);
  });

  it("should redirect prototype-assigned properties as instance properties", function() {
    const symtree = buildSymbolTree(`
      ClassName.prototype.propertyName = "dataValue";
    `);

    expect(symtree.members[0].meta.scope).to.equal("instance");
    expect(symtree.members[0].meta.object).to.equal("ClassName");
  });

  it("should parse assigned function expressions correctly", function() {
    const symtree = buildSymbolTree("const functionName = function(param1, param2) {}");

    expect(symtree.members.length).to.equal(1);

    const symbolFunctionName = symtree.members[0];

    expect(symbolFunctionName.meta.params.length).to.equal(2);
  });

  it("should parse assigned arrow-function expressions correctly", function() {
    const symtree = buildSymbolTree("const functionName = (param1, param2) => {}");

    expect(symtree.members.length).to.equal(1);

    const symbolFunctionName = symtree.members[0];

    expect(symbolFunctionName.meta.params.length).to.equal(2);
  });
});
