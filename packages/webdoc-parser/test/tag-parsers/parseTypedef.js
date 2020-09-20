const {parseTypedef} = require("../../lib/tag-parsers/parseTypedef");

const expect = require("chai").expect;

describe("@webdoc/parser.parseTypedef", function() {
  it("@typedef {DataType} TypeName", function() {
    const doc = {};

    parseTypedef("{DataType} TypeName", doc);

    expect(doc.name).to.equal("TypeName");
    expect(doc.dataType[0]).to.equal("DataType");
  });

  it("@typedef TypeName", function() {
    const doc = {};

    parseTypedef(" TypeName", doc);

    expect(doc.name).to.equal("TypeName");
  });
});
