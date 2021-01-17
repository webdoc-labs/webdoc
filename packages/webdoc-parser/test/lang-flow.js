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
});
