
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

  it("should work with property parameters", async function() {
    const documentTree = await parse([{
      content: `
        class RedBlackTree {
          /** HERE */
          constructor(protected readonly root: Node) {}
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const rootProperty = findDoc("RedBlackTree.root", documentTree);
    const ctor = findDoc("RedBlackTree.constructor", documentTree);

    expect(rootProperty).to.not.equal(null);
    expect(rootProperty.access).to.equal("protected");
    expect(rootProperty.dataType[0]).to.equal("Node");
    expect(rootProperty.name).to.equal("root");
    expect(rootProperty.readonly).to.equal(true);

    expect(ctor).to.not.equal(null);
    expect(ctor.params.length).to.equal(1);

    const rootParameter = ctor.params[0];

    expect(rootParameter.dataType[0]).to.equal("Node");
    expect(rootParameter.identifier).to.equal("root");
  });

  it("should work with property parameter when default values are assigned", async function() {
    const documentTree = await parse([{
      content: `
        class AVLTree {
          /** HERE */
          constructor(protected root: Node = "null") {}
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const rootProperty = findDoc("AVLTree.root", documentTree);
    const ctor = findDoc("AVLTree.constructor", documentTree);

    expect(rootProperty).to.not.equal(null);
    expect(ctor).to.not.equal(null);

    expect(rootProperty.defaultValue).to.equal("\"null\"");
    expect(ctor.params[0].default).to.equal("\"null\"");
  });
});
