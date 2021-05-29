
const {createPackageDoc, findDoc} = require("@webdoc/model");
const {parse} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.parse (Typescript)", function() {
  it("should infer access, default value, and type for fields", async function() {
    const docs = await parse([{
      content: `
        /** Example class */
        class Example {
          /**
           * Field description
           */
          protected readonly field: boolean = true;
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    expect(docs.members.length).to.equal(1);
    expect(docs.members[0].members.length).to.be.gte(1);

    const fieldDoc = docs.members[0].members[0];

    expect(fieldDoc.access).to.equal("protected");
    expect(fieldDoc.dataType && fieldDoc.dataType[0]).to.equal("boolean");
    expect(fieldDoc.defaultValue).to.equal("true");
    expect(fieldDoc.readonly).to.equal(true);

    // TODO: Fix this. No space should be there (added/not-fixed b/c this was
    // in a PR for different issue)
    expect(fieldDoc.brief).to.equal(" Field description");
  });

  it("should infer access, returns for methods", async function() {
    const docs = await parse([{
      content: `
        class Resource {
          /** Method */
          protected onPlay(): void {
            this._playing = true;
          }
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const methodDoc = findDoc("Resource.onPlay", docs);

    expect(methodDoc.name).to.equal("onPlay");
    expect(methodDoc.access).to.equal("protected");
    expect(methodDoc.returns[0].dataType[0]).to.equal("void");
  });
});
