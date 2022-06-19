const {buildSymbolTree} = require("../../src/parse");
const resolveLinks = require("../../src/assembler/mod-resolve-links").default;
const expect = require("chai").expect;

describe("@webdoc/parser.assemble{@assembly-mod resolve-link}", function() {
  it("should resolve superclasses", function() {
    const symbolTree = buildSymbolTree(`
      class Engine {}
      class SpecializedEngine extends Engine {}
    `);

    resolveLinks(symbolTree);

    expect(symbolTree.members.length).to.eq(2);
    expect(symbolTree.members[1].meta.extends.length).to.eq(1);
    expect(symbolTree.members[1].meta.extends[0]).not.to.be.a("string");
  });

  it("should resolve implemented interfaces", function() {
    const symbolTree = buildSymbolTree(`
      /** IFC */
      interface HelloWorld {}
      /** EXM */
      class Example implements HelloWorld {}
    `, ".ts");

    resolveLinks(symbolTree);

    expect(symbolTree.members.length).to.eq(2);
    expect(symbolTree.members[1].meta.implements.length).to.eq(1);
    expect(symbolTree.members[1].meta.implements[0]).not.to.be.a("string");
  });

  it("should resolve data types", function() {
    const symbolTree = buildSymbolTree(`
      /** MATRIX-2D */
      class Matrix {}
      
      /** TRANSFORM */
      class Transform {
        /** LOCAL-MATRIX */
        localMatrix: Matrix;
      }
    `, ".ts");

    resolveLinks(symbolTree);

    expect(symbolTree.members.length).to.eq(2);
    expect(symbolTree.members[1].members[0].meta.dataType[1]).not.be.a("string");
  });
});
