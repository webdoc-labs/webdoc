const {parse} = require("../lib/parse");
const {doc: findDoc} = require("@webdoc/model");

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

  it("should infer 'extends', 'implements' even if target is @memberof something else", function() {
    const docs = parse(new Map(Object.entries({
      "index.ts": `
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
    `})));

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

  it("should not coalesce assigned symbols at the same line,column in different files", function() {
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

    const symtree = parse(new Map(Object.entries({
      "file1.js": file1,
      "file2.js": file2,
      "main.js": main,
    })));

    expect(symtree.members.length).to.equal(1);
    expect(symtree.members[0].members.length).to.equal(2);
    expect(symtree.members[0].members[0].name).to.equal("Class1");
    expect(symtree.members[0].members[1].name).to.equal("Class2");
  });
});
