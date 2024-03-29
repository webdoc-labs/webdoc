const {parse} = require("../src/parse");
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

  it("should respect ignore tags on all classes", async function() {
    const documentTree = await parse(`
      /**
       * @ignore
       */
      export class FirstIgnoreClass {}
      
      /**
       * @ignore
       */
      export class SecondIgnoreClass {}
      
      /**
       * @ignore
       */
      export class ThirdIgnoreClass {}
    `);

    expect(documentTree.members.length).to.equal(0);
  });

  it("resolve @classdesc even for ES6 classes", async function() {
    const documentTree = await parse(`
      /**
       * Brief.
       *
       * Good evening!
       * @classdesc
       * Hello world!
       */
       class Engine {
         constructor() {}
       }
    `);

    const engineClass = documentTree.members[0];

    expect(engineClass.description).to.include("Good evening!");
    expect(engineClass.description).to.include("Hello world!");
  });

  it("should resolve objects properties using string literals as keys correctly", async function() {
    const documentTree = await parse(`
      /** @namespace input */
      /**
       * standard keyboard constants
       * @public
       * @enum {number}
       * @namespace KEY
       * @memberof input
       */
      const KEY = {
          /** @memberof input.KEY */      
          "BACKSPACE" : 8,
          /** @memberof input.KEY */
          "TAB" : 9,
          /** @memberof input.KEY */
          "ENTER" : 13,
      };
    `);

    const docKeyEnum = findDoc("input.KEY", documentTree);

    expect(docKeyEnum.members.length).to.equal(3);
  });

  it("should parse method overloads in orphan doc comments", async function() {
    const documentTree = await parse(`
      /** Rectangle */
      class Rect {
        /**
         * Returns true if the rectangle contains the given rectangle
         * @name contains
         * @memberof Rect
         * @function
         * @param {Rect} rect
         * @returns {boolean} true if contains
         */
    
        /**
         * Returns true if the rectangle contains the given point
         * @name contains
         * @memberof Rect
         * @function
         * @param  {number} x - x coordinate
         * @param  {number} y - y coordinate
         * @returns {boolean} true if contains
         */
    
        /**
         * Returns true if the rectangle contains the given point
         * @name contains
         * @memberof Rect
         * @function
         * @param {Vector2d} point
         * @returns {boolean} true if contains
         */
        contains() { }
      }
    `);

    expect(findDoc("Rect", documentTree).members.length).to.equal(4);
  });
});
