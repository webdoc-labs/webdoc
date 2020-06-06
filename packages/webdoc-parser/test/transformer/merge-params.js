const mergeParams = require("../../lib/transformer/merge-params").default;

const expect = require("chai").expect;

describe("@webdoc/parser.Transformer{@merger params}", function() {
  it("should merge data-type, optional, variadic flags", function() {
    const documented = [
      {identifier: "opts"},
      {identifier: "opts.subopts"},
      {identifier: "opts.subopts2"},
      // don't document opts.subopts2.subsubopts
      {identifier: "opts2"},
    ];

    const meta = [
      {identifier: null, dataType: ["object"], optional: false},
      {identifier: ".subopts", dataType: ["string"], optional: true},
      {identifier: ".subopts2", dataType: ["object"]},
      {identifier: ".subopts2.subsubopts", dataType: ["string"]},
      {identifier: "opts2", dataType: ["object"], optional: true, variadic: true},
    ];

    mergeParams(documented, meta);

    expect(documented[0].optional).to.equal(false);
    expect(documented[1].optional).to.equal(true);
    expect(documented[2].optional).to.equal(undefined);
    expect(documented[3].optional).to.equal(true);

    expect(documented[3].variadic).to.equal(true);
  });
});
