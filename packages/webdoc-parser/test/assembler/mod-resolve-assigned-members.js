const {buildSymbolTree} = require("../../lib/parse.js");
const resolveAssignedMembersRecursive =
  require("../../lib/assembler/mod-resolve-assigned-members.js");
const expect = require("chai").expect;

describe("@webdoc/parser.assemble{@assembly-mod resolve-assigned-members}", function() {
  it("should be able to correctly resolve the 'this' context a constructor", function() {
    const symtree = buildSymbolTree(`
      /** @class */
      class ClassName {
        constructor() {
          /** @member {string} */
          this.classProperty = "defaultValue";
        }
      }
    `);

    resolveAssignedMembersRecursive(symtree);

    expect(symtree.members.length).to.equal(1);
    expect(symtree.members[0].name).to.equal("ClassName");

    const symClassName = symtree.members[0];

    const symConstructor = symClassName.members.find((sym) => sym.name === "constructor");
    const symClassProperty = symClassName.members.find((sym) => sym.name === "classProperty");

    expect(!!symConstructor).to.equal(true);
    expect(!!symClassProperty).to.equal(true);

    // No ghost classProperty left behind!
    expect(symConstructor.members.length).to.equal(0);
  });

  it("should be able to correctly resolve nested object properties", function() {
    const symtree = buildSymbolTree(`
      object.nestedObject.propertyName = "dataValue";
      object.nestedObject = {};
      const object = {};
    `);

    resolveAssignedMembersRecursive(symtree);

    expect(symtree.members.length).to.equal(1);
    expect(symtree.members[0].name).to.equal("object");

    expect(symtree.members[0].members.length).to.equal(1);
    expect(symtree.members[0].members[0].name).to.equal("nestedObject");

    expect(symtree.members[0].members[0].members.length).to.equal(1);
    expect(symtree.members[0].members[0].members[0].name).to.equal("propertyName");
  });
});
