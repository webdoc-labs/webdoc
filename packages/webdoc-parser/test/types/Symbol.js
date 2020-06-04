const {findSymbol, findAccessedSymbol} = require("../../lib/types/Symbol");
const {buildSymbolTree} = require("../../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.Symbol", function() {
  describe("findAccessedSymbol", function() {
    it("should find an adjacent symbol", function() {
      const symtree = buildSymbolTree(`
      function Ctor() {}

      function makeClass() {
        class Ctor {}

        Ctor.staticProperty = "dataValue";
        //^^

        return Ctor;
      }
    `);

      const symbolStaticProperty = findSymbol("makeClass~staticProperty", symtree);

      expect(symbolStaticProperty).to.not.equal(null);

      const symbolCtorInner = findAccessedSymbol("Ctor", symbolStaticProperty);

      expect(symbolCtorInner).to.not.equal(null);
      expect(symbolCtorInner.meta.type).to.equal("ClassDoc");
    });

    it("should find a symbol referred to by its canonical name", function() {
      const symtree = buildSymbolTree(`
        const object = {};

        function doSomething() {
          object.propertyName = "dataValue";
        }

        function makeClass() {
          class object {}

          return object;
        }
      `);

      const symbolPropertyName = findSymbol("doSomething~propertyName", symtree);

      expect(symbolPropertyName).to.not.equal(null);

      const symbolObject = findAccessedSymbol("object", symbolPropertyName);

      expect(symbolObject).to.not.equal(null);
      expect(symbolObject.meta.type).to.not.equal("ClassDoc");
    });
  });
});
