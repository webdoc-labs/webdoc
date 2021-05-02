const external = require("../lib");
const model = require("@webdoc/model");
const parser = require("@webdoc/parser");

const expect = require("chai").expect;

describe("@webdoc/externalize (read-write test)", function() {
  it("should deserialize a serialized documented interface properly", function() {
    const inputTree = parser.parse(`
      /** Symbol 0 */
      class Symbol0 {
        /** Symbol 1 */
        constructor() {}
        
        /** Symbol 2 */
        symbol2() {}
        
        /** Symbol 3 */
        symbol3 = 3;
      }
      
      /**
       * @namespace Symbol4
       *
       * Symbol 4
       */
              
      /**
       * @interface Symbol5
       * @memberof Symbol4
       *
       * Symbol 5
       */
    `);

    const documentedInterface = external.fromTree(inputTree);
    const {root: outputTree} = external.read(external.write(documentedInterface));

    expect(outputTree.members.length).to.equal(2);

    const [symbol0] = [model.doc("Symbol0", outputTree)];

    expect(symbol0.brief).to.include("Symbol 0");
  });
});
