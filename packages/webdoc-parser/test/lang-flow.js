const {buildSymbolTree} = require("../lib/parse");

const expect = require("chai").expect;

describe("@webdoc/parser.LanguageIntegration{@lang flow}", function() {
  it("should parse extends, implements", function() {
    const symtree = buildSymbolTree(`
      interface IArrayBuffer extends ArrayBuffer {}
      class ArrayBufferImpl implements ArrayBuffer {}
      interface SpecializedArrayBuffer extends Special.ArrayBuffer {}
      class SpecializedArrayBufferImpl extends Special.ArrayBuffer {}
    `, "*.js");

    const [
      iarrayBuffer,
      arrayBufferImpl,
      specializedArrayBuffer,
      specializedArrayBufferImpl,
    ] = symtree.members;

    expect(iarrayBuffer.meta.extends[0]).to.equal("ArrayBuffer");
    expect(arrayBufferImpl.meta.implements[0]).to.equal("ArrayBuffer");
    expect(specializedArrayBuffer.meta.extends[0]).to.equal("Special.ArrayBuffer");
    expect(specializedArrayBufferImpl.meta.extends[0]).to.equal("Special.ArrayBuffer");
  });

  it("should parse type parameters", function() {
    const symbolTree = buildSymbolTree(`
      class Builder {
        /** Resources, duh! */
        resources: Array<T>;
      }
    `, ".js");

    expect(symbolTree.members[0].members[0].meta.dataType[0]).to.equal("Array<T>");
  });

  it("should expand object pattern parameters", function() {
    const symbolTree = buildSymbolTree(`
      function length({ p0: { x: x0, y: y0 } }: { p0: { x: number, y: number} }) {}
    `);

    const lengthFn = symbolTree.members[0];

    expect(lengthFn.meta.params.length).to.equal(3);
    expect(lengthFn.meta.params[1].identifier).to.equal(".p0.x");
    expect(lengthFn.meta.params[1].dataType[0]).to.equal("number");
    expect(lengthFn.meta.params[2].identifier).to.equal(".p0.y");
    expect(lengthFn.meta.params[2].dataType[0]).to.equal("number");
  });

  it("should expand object pattern parameters with default values", function() {
    const symbolTree = buildSymbolTree(`
      function length({ p0: { x: x0, y: y0 } }: { p0: { x: number, y: number} }
        = { p0: { x: 1, y: 2 } } ) {}
    `);

    const lengthFn = symbolTree.members[0];

    expect(lengthFn.meta.params.length).to.equal(3);
    expect(lengthFn.meta.params[0].dataType[0]).to.equal("{ p0: { x: number, y: number } }");
    expect(lengthFn.meta.params[1].default).to.equal("1");
    expect(lengthFn.meta.params[2].default).to.equal("2");
    expect(lengthFn.meta.params[1].dataType[0]).to.equal("number");
    expect(lengthFn.meta.params[2].dataType[0]).to.equal("number");
  });
});
