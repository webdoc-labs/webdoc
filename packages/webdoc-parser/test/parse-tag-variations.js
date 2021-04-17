const {parse} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.parse (tag variations)", function() {
  it("should not fail when @returns doesn't have a type annotation", function() {
    const program = () => parse([{
      content: `
        /** @returns - The sum of a, b */
        function add(a, b) {}
        
        class Op {
          /** @returns - The operator applied on a, b */
          run(a, b): number {}
        }
      `,
      path: "*.ts",
    }]);

    expect(program).to.not.throw();
  });
});
