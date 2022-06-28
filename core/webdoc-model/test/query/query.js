const {
  addChildDoc,
  createDoc,
  createRootDoc,
  createSimpleKeywordType,
  query,
} = require("../../lib");

const expect = require("chai").expect;

describe("@webdoc/model:query", function() {
  const documentTree = createRootDoc();
  const nsDoc = addChildDoc(createDoc("ns", "NSDoc"), documentTree);
  const parentClassDoc = addChildDoc(createDoc("ParentClass", "ClassDoc"), nsDoc);

  addChildDoc(createDoc("invoke", "MethodDoc", {
    params: [{
      identifier: "arg0",
      dataType: createSimpleKeywordType("number"),
      description: "Arg 0",
    }],
  }), parentClassDoc);
  addChildDoc(createDoc("invoke", "MethodDoc", {
    params: [{
      identifier: "arg0",
      dataType: createSimpleKeywordType("string"),
      description: "Arg 0",
    }],
  }), parentClassDoc);

  it("should discriminate based on parameter data type variant", function() {
    const m1Result = query("ns.ParentClass#invoke[params[0][dataType] = number]", documentTree);
    const m2Result = query("ns.ParentClass#invoke[params[0][dataType] = string]", documentTree);

    expect(m1Result.length).to.be.greaterThan(0);
    expect(m2Result.length).to.be.greaterThan(0);
    expect(m1Result[0].params[0].dataType[0]).to.equal("number");
    expect(m2Result[0].params[0].dataType[0]).to.equal("string");
  });
});
