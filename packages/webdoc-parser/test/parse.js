const {parse} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.parse", function() {
  it("should generate documentation for headless comments", function() {
    const docs = parse(`
        /** @memberof NS */
        class ClassName {

        }

        /**
         * @namespace NS
         */
    `);

    expect(docs.members.length).to.equal(1);
    expect(docs.members[0].name).to.equal("NS");
    expect(docs.members[0].type).to.equal("NSDoc");
    expect(docs.members[0].members.length).to.equal(1);
  });

  it("should generate documentation for headless comments before imports", function() {
    const docs = parse(`
        /** @namespace Root */
        import DefaultImportName from "./mock-module-name";
    `);

    expect(docs.members.length).to.equal(1);
  });
});
