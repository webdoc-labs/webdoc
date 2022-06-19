const {parseParam} = require("../../src/tag-parsers/parseParam");

const expect = require("chai").expect;

describe("@webdoc/parser.parseParam", function() {
  it("@param {DataType} paramName - <description>", function() {
    const doc = {};

    parseParam("{DataType} paramName - <description>", doc);

    const param = doc.params[0];

    expect(param.identifier).to.equal("paramName");
    expect(param.dataType).to.not.equal(undefined);
    expect(param.dataType[0]).to.equal("DataType");
    expect(param.description).to.equal("<description>");

    // Allow metadata to merge into these fields (by not being false but undefined)
    expect(param.defaultValue).to.equal(undefined);
    expect(param.optional).to.equal(undefined);
    expect(param.variadic).to.equal(undefined);
  });

  it("@param {DataType}[paramName] - <description>", function() {
    const doc = {};

    parseParam("{DataType}[paramName] - <description>", doc);

    const param = doc.params[0];

    expect(param.identifier).to.equal("paramName");
    expect(param.dataType).to.not.equal(undefined);
    expect(param.dataType[0]).to.equal("DataType");
    expect(param.description).to.equal("<description>");

    expect(param.optional).to.equal(true);
  });

  it("@param {DataType}[paramName=defaultValue] - <description>", function() {
    const doc = {};

    parseParam("{DataType}[paramName=defaultValue] - <description>", doc);

    const param = doc.params[0];

    expect(param.identifier).to.equal("paramName");
    expect(param.dataType[0]).to.equal("DataType");
    expect(param.description).to.equal("<description>");

    expect(param.default).to.equal("defaultValue");
    expect(param.optional).to.equal(true);
  });

  it("@param {DataType}[paramName=defaultValue[]] - <description>", function() {
    const doc = {};

    parseParam("{DataType}[paramName=defaultValue[]] - <description>", doc);

    const param = doc.params[0];

    expect(param.identifier).to.equal("paramName");
    expect(param.dataType[0]).to.equal("DataType");
    expect(param.description).to.equal("<description>");

    expect(param.default).to.equal("defaultValue[]");
    expect(param.optional).to.equal(true);
  });

  it("@param paramName - <description> with {@link Symbol}", function() {
    const doc = {};

    parseParam("paramName - <description> with {@link Symbol}", doc);

    const param = doc.params[0];

    expect(param.dataType).to.equal(undefined);
  });
});
