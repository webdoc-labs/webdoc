const {
  parse,
} = require("../../lib/query/parse");

const expect = require("chai").expect;

describe("@webdoc/model:query.parse", function() {
  it("NS.Class", function() {
    const query = parse("NS.Class");

    expect(query.steps.length).to.equal(2);
    expect(query.steps[0].qualifier).to.equal("NS");
    expect(query.steps[0].variant).to.equal(undefined);
    expect(query.steps[1].qualifier).to.equal("Class");
    expect(query.steps[1].variant).to.equal(undefined);
  });

  it("...NestedEnum", function() {
    const query = parse("...NestedEnum");

    expect(query.steps.length).to.equal(1);
    expect(query.steps[0].qualifier).to.equal("NestedEnum");
    expect(query.steps[0].type).to.equal("r-member");
  });

  it("NS[packageName=@scope/pkg]", function() {
    const query = parse("NS[packageName=@scope/pkg]");

    expect(query.steps.length).to.equal(1);
    expect(query.steps[0].qualifier).to.equal("NS");
    expect(query.steps[0].variant).to.not.equal(undefined);
    expect(query.steps[0].variant.conditions.length).to.equal(1);
    expect(query.steps[0].variant.conditions[0].attribute).to.equal("packageName");
    expect(query.steps[0].variant.conditions[0].value).to.equal("@scope/pkg");
  });
});
