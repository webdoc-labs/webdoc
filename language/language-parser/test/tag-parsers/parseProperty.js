const {parseProperty} = require("../../src/tag-parsers/parseProperty");

const expect = require("chai").expect;

describe("@webdoc/parser.parseProperty", function() {
  it("@property {DataType} propertyName <description>", function() {
    const doc = {};

    parseProperty("{DataType} propertyName <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType).to.not.equal(undefined);
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType} propertyName=dataValue <description>", function() {
    const doc = {};

    parseProperty("{DataType} propertyName=dataValue <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType).to.not.equal(undefined);
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.constant).to.equal(true);
    expect(propertyDoc.dataValue).to.equal("dataValue");
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType} propertyName=\"DATA VALUE\" <description>", function() {
    const doc = {};

    parseProperty("{DataType} propertyName=\"DATA VALUE\" <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType).to.not.equal(undefined);
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.constant).to.equal(true);
    expect(propertyDoc.dataValue).to.equal("\"DATA VALUE\"");
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType} propertyName='DATA VALUE' <description>", function() {
    const doc = {};

    parseProperty("{DataType} propertyName='DATA VALUE' <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType).to.not.equal(undefined);
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.constant).to.equal(true);
    expect(propertyDoc.dataValue).to.equal("'DATA VALUE'");
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType} propertyName=-numberDefaultValue - <description>", function() {
    const doc = {};

    parseProperty("{DataType} propertyName=-numberDefaultValue - <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.constant).to.equal(true);
    expect(propertyDoc.dataValue).to.equal("-numberDefaultValue");
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType}[propertyName] <description>", function() {
    const doc = {};

    parseProperty("{DataType}[propertyName] <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType).to.not.equal(undefined);
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.optional).to.equal(true);
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType}[propertyName=defaultValue] <description>", function() {
    const doc = {};

    parseProperty("{DataType}[propertyName=defaultValue] <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType).to.not.equal(undefined);
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.optional).to.equal(true);
    expect(propertyDoc.defaultValue).to.equal("defaultValue");
    expect(propertyDoc.description).to.equal("<description>");
  });

  it("@property {DataType}[propertyName=defaultValue[]] <description>", function() {
    const doc = {};

    parseProperty("{DataType}[propertyName=defaultValue[]] <description>", doc);

    const propertyDoc = doc.members[0];

    expect(propertyDoc.name).to.equal("propertyName");
    expect(propertyDoc.dataType[0]).to.equal("DataType");
    expect(propertyDoc.optional).to.equal(true);
    expect(propertyDoc.defaultValue).to.equal("defaultValue[]");
    expect(propertyDoc.description).to.equal("<description>");
  });
});
