const {findDoc} = require("@webdoc/model");
const {parse} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.parse (ES5 classes)", function() {
  it("should correctly infer ES5 classes", async function() {
    const docTree = await parse(`      
      /**
       * ES5 constructor
       * @classdesc
       * Example ES5 class
       * @class
       */
      function ES5Class() {
      }

      /** ES5 method (ironic arrow fn) */      
      ES5Class.prototype.es5Method = () => {};
      
      /** ES5 static method */
      ES5Class.es5StaticMethod = function() {};
      
      /** ES5 property */
      ES5Class.prototype.es5Property = "value";
      
      /** ES5 static property */
      ES5Class.es5StaticProperty = "static-value";
    `);

    const es5Class = findDoc("ES5Class", docTree);
    const es5Constructor = findDoc("ES5Class.constructor", docTree);

    expect(es5Class.description).to.not.include("ES5 constructor");
    expect(es5Class.description).to.include("ES5 class");
    expect(es5Constructor.description).to.not.include("ES5 class");
    expect(es5Constructor.description).to.include("ES5 constructor");

    const es5Method = findDoc("ES5Class.es5Method", docTree);
    const es5StaticMethod = findDoc("ES5Class.es5StaticMethod", docTree);
    const es5Property = findDoc("ES5Class.es5Property", docTree);
    const es5StaticProperty = findDoc("ES5Class.es5StaticProperty", docTree);

    expect(es5Method.scope).to.equal("instance");
    expect(es5Method.type).to.equal("MethodDoc");

    expect(es5StaticMethod.scope).to.equal("static");
    expect(es5StaticMethod.type).to.equal("MethodDoc");

    expect(es5Property.defaultValue).to.equal("\"value\"");
    expect(es5Property.scope).to.equal("instance");
    expect(es5Property.type).to.equal("PropertyDoc");

    expect(es5StaticProperty.defaultValue).to.equal("\"static-value\"");
    expect(es5StaticProperty.scope).to.equal("static");
    expect(es5StaticProperty.type).to.equal("PropertyDoc");
  });
});
