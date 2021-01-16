const {buildSymbolTree} = require("../lib/parse");
const {findSymbol} = require("../lib/types/Symbol");

const expect = require("chai").expect;

describe("@webdoc/parser.LanguageIntegration{@lang js}", function() {
  it("should parse classes correctly", function() {
    const symtree = buildSymbolTree(`
      class ClassName {
        initProperty = 9

        constructor() { }

        classMethod() { }
        get classProperty() { return 0; }
        set classProperty(val) { }

        static staticMethod() { }
        get staticProperty() { return 0; }
        set staticProperty(val) { }
      }
    `);

    expect(symtree.members.length).to.equal(1);

    const symClassName = symtree.members[0];

    expect(symClassName.members.length).to.equal(6);

    const symInitProperty = findSymbol("ClassName.initProperty", symtree);

    expect(findSymbol("ClassName.constructor", symtree)).to.not.equal(undefined);
    expect(findSymbol("ClassName.classProperty", symtree)).to.not.equal(undefined);
    expect(findSymbol("ClassName.classMethod", symtree)).to.not.equal(undefined);
    expect(symInitProperty).to.not.equal(undefined);
    expect(symInitProperty.meta.defaultValue).to.equal(9);
  });

  it("should parse assigned members properly", function() {
    const symtree = buildSymbolTree(`
      const ObjectName = {
        inlineMethodName() {},
        inlinePropertyName: 21
      };

      ObjectName.methodName = function() { }
      ObjectName.propertyName = 24;
    `);

    expect(symtree.members.length).to.equal(3);

    const symbolMethodName = symtree.members.find((sym) => sym.simpleName === "methodName");

    expect(symbolMethodName).to.not.equal(undefined);
    expect(symbolMethodName.meta.object).to.equal("ObjectName");

    const symbolPropertyName = symtree.members.find((sym) => sym.simpleName === "propertyName");

    expect(symbolPropertyName).to.not.equal(undefined);
    expect(symbolPropertyName.meta.object).to.equal("ObjectName");
  });

  it("should parse separate symbols with the same name", function() {
    const symtree = buildSymbolTree(`
      /** @namespace NSName */

      {
        /**
         * @memberof NSName
         */
        const constantName = "dataValue";
      }

      /** This is a constant */
      const constantName = "someOtherValue";
    `);

    expect(symtree.members.length).to.equal(3);
    expect(symtree.members[1].simpleName).to.equal("constantName");
    expect(symtree.members[2].simpleName).to.equal("constantName");
  });

  it("should parse initializer functions correctly", function() {
    const symtree = buildSymbolTree(`
      /** This is a class */
      const ClassName = (() => {
        class ClassName {
          constructor() {}
        }

        return ClassName;
      })();
    `);

    expect(symtree.members.length).to.equal(1);

    const symbolClassName = symtree.members[0];

    expect(symbolClassName.simpleName).to.equal("ClassName");
    expect(symbolClassName.meta.type).to.equal("ClassDoc");
    expect(symbolClassName.comment).to.equal(" This is a class");

    expect(symbolClassName.members.length).to.equal(1);
    expect(symbolClassName.members[0].simpleName).to.equal("constructor");
    expect(symbolClassName.members[0].members.length).to.equal(0);
  });

  it("should mark const variable declarations as readonly", function() {
    const symtree = buildSymbolTree(`
      const variable = "value";
      let mutable = "mutable";
    `);

    expect(symtree.members.length).to.equal(2);
    expect(symtree.members[0].meta.readonly).to.equal(true);
    expect(symtree.members[1].meta.readonly).to.not.equal(true);
  });

  it("should not crash with rest object properties syntax", function() {
    expect(
      () => buildSymbolTree(`
        const { a, b, ...rest } = globalThis;
      `),
    ).to.not.throw();
  });
});
