const prune = require("../../src/transformer/mod-prune").default;

const expect = require("chai").expect;

describe("@webdoc/parser.Transformer{@merger prune}", function() {
  it("should prune all children if all are ignored", function() {
    const root = {
      name: "<<root>>",
    };
    const documents = [
      {name: "FirstIgnoreClass", members: [], parent: root, tags: [{name: "ignore"}]},
      {name: "SecondIgnoreClass", members: [], parent: root, tags: [{name: "ignore"}]},
      {name: "ThirdIgnoreClass", members: [], parent: root, tags: [{name: "ignore"}]},
    ];
    root.members = documents;

    prune(root);

    expect(root.members.length).to.equal(0);
  });
});
