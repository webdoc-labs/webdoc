const {createPackageDoc} = require("@webdoc/model");
const {parse} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.parser", function() {
  it("should infer access, default value, and type for fields", function() {
    const docs = parse([{
      content: `
/** Example class */
class Example {
  /**
   * Field description
   */
  protected field: boolean = true;
}
`,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    expect(docs.members.length).to.equal(1);
    expect(docs.members[0].members.length).to.equal(1);

    const fieldDoc = docs.members[0].members[0];

    expect(fieldDoc.access).to.equal("protected");
    expect(fieldDoc.dataType && fieldDoc.dataType[0]).to.equal("boolean");
    expect(fieldDoc.defaultValue).to.equal(true);

    // TODO: Fix this. No space should be there (added/not-fixed b/c this was
    // in a PR for different issue)
    expect(fieldDoc.brief).to.equal(" Field description");
  });
});
