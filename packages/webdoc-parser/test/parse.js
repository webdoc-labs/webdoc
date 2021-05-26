const {parse} = require("../lib/parse");
const {doc: findDoc} = require("@webdoc/model");

const expect = require("chai").expect;

describe("@webdoc/parser.parse", function() {
  it("should generate documentation for headless comments", async function() {
    const docs = await parse(`
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

  it("should generate documentation for headless comments before imports", async function() {
    const docs = await parse(`
        /** @namespace Root */
        import DefaultImportName from "./mock-module-name";
    `);

    expect(docs.members.length).to.equal(1);
  });

  it("should infer 'extends', 'implements' even if target is @memberof something else",
    async function() {
      const docs = await parse([{
        path: "index.ts",
        package: {},
        content: `
        /** @namespace NSName */
  
        /**
         * @class
         * @memberof NSName
         */
        class SuperClassName {
        }
  
        /**
         * @interface
         * @memberof NSName
         */
        interface InterfaceName {
        }
  
        /** @class */
        class ClassName extends SuperClassName implements InterfaceName {
  
        }
      `}]);

      expect(docs.members.length).to.equal(2);

      expect(docs.members.find((doc) => doc.type === "NSDoc" && doc.name === "NSName"))
        .to.not.equal(undefined);

      const docSuperClassName = findDoc("NSName.SuperClassName", docs);
      const docInterfaceName = findDoc("NSName.InterfaceName", docs);

      expect(docSuperClassName).to.not.equal(undefined);
      expect(docInterfaceName).to.not.equal(undefined);

      const docClassName = findDoc("ClassName", docs);

      expect(docClassName).to.not.equal(undefined);
      expect(docClassName.extends).to.not.equal(undefined);
      expect(docClassName.extends[0]).to.equal(docSuperClassName);
      expect(docClassName.implements).to.not.equal(undefined);
      expect(docClassName.implements[0]).to.equal(docInterfaceName);
    });

  it("should not coalesce assigned symbols at the same line,column in different files",
    async function() {
      const file1 = `
        /** This is class1 */
        settings.Class1 = {}
      `;

      const file2 = `
        /** This is class2 */
        settings.Class2 = {}
      `;

      const main = `
        const settings = {};
      `;

      const symtree = await parse([
        {content: file1, path: "file1.js", package: {}},
        {content: file2, path: "file2.js", package: {}},
        {content: main, path: "main.js", package: {}},
      ]);

      expect(symtree.members.length).to.equal(1);
      expect(symtree.members[0].members.length).to.equal(2);
      expect(symtree.members[0].members[0].name).to.equal("Class1");
      expect(symtree.members[0].members[1].name).to.equal("Class2");
    });

  it("should not coalesce symbols at different locations with the same name", async function() {
    const docs = await parse(`
      /** @namespace NS1 */
      const NS1 = {};

      /** @namespace NS2 */
      const NS2 = {};

      Object.defineProperties(NS1, {
        /**
         * @memberof NS1
         * @member {string}
         */
        PROP_NAME: {}
      })

      Object.defineProperties(NS2, {
        /**
         * @memberof NS2
         * @member {string}
         */
        PROP_NAME: {}
      })
    `);

    expect(docs.members.length).to.equal(2);

    const docNS2 = docs.members[1];

    expect(docNS2.members.length).to.equal(1);
    expect(docNS2.members[0].name).to.equal("PROP_NAME");

    const docNS1 = docs.members[0];

    expect(docNS1.members.length).to.equal(1);
    expect(docNS1.members[0].name).to.equal("PROP_NAME");
  });
});
