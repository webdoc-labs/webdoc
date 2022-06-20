const {buildSymbolTree} = require("../src/parse");
const {assemble} = require("../src/assembler/assemble");
const {findSymbol} = require("../src/types/Symbol");

const expect = require("chai").expect;

describe("@webdoc/parser.LanguageIntegration{@lang ts}", function() {
  it("should parse classes correctly", function() {
    let symtree = buildSymbolTree(`
      class ClassName {
        private readonly initProperty: number = -11;

        constructor() {
          /**
           * This is a property whose data-type & access should be inferred.
           */
          this.initProperty = 9;
        }

        classMethod() { }
        get classProperty(): number { return 0; }
        set classProperty(val: number) { }

        static staticMethod() { }
        get staticProperty(): number { return 0; }
        set staticProperty(val: number) { }
      }
    `, ".ts");

    symtree = assemble([symtree]);

    expect(symtree.members.length).to.equal(1);

    const symClassName = symtree.members[0];

    expect(symClassName.members.length).to.equal(6);

    expect(findSymbol("ClassName.constructor", symtree)).to.not.equal(undefined);
    expect(findSymbol("ClassName.classProperty", symtree)).to.not.equal(undefined);
    expect(findSymbol("ClassName.classMethod", symtree)).to.not.equal(undefined);
    expect(findSymbol("ClassName.initProperty", symtree)).to.not.equal(undefined);

    // Inference test

    const symbolInitProperty = findSymbol("ClassName.initProperty", symtree);

    expect(symbolInitProperty.meta.dataType).to.not.equal(undefined);
    expect(symbolInitProperty.meta.dataType[0]).to.equal("number");
    expect(symbolInitProperty.meta.access).to.equal("private");
    expect(symbolInitProperty.meta.defaultValue).to.equal("9");
    expect(symbolInitProperty.comment).to.not.equal("");
    expect(symbolInitProperty.meta.readonly).to.equal(true);

    const symbolClassProperty = findSymbol("ClassName.classProperty", symtree);

    expect(symbolClassProperty.meta.dataType).to.not.equal(undefined);
    expect(symbolClassProperty.meta.dataType[0]).to.equal("number");
  });

  it("should parse interfaces correctly", function() {
    const symbolTree = buildSymbolTree(`
      interface IModelSchema {
        readonly schemaId: string;        
        serialize(): any;
      }
    `, "*.ts");

    const schemaId = findSymbol("IModelSchema.schemaId", symbolTree);
    const serialize = findSymbol("IModelSchema.serialize", symbolTree);

    expect(schemaId.meta.readonly).to.equal(true);
    expect(schemaId.meta.dataType[0]).to.equal("string");
    expect(serialize.meta.returns[0].dataType[0]).to.equal("any");
  });

  it("should be able to parse type-casted objects for property symbols", function() {
    const symtree = buildSymbolTree(`
      (objectName as ObjectType).propertyName = "dataValue";
    `, ".ts");

    expect(symtree.members.length).to.equal(1);

    const symbolPropertyName = symtree.members[0];

    expect(symbolPropertyName.meta.object).to.equal("objectName");
  });

  it("should not output parameter property symbols even with type-cast", function() {
    const symtree = buildSymbolTree(`
      function functionName(paramName: object): void {
        (paramName as any).propertyName = "dataValue";
      }
    `, ".ts");

    expect(symtree.members.length).to.equal(1);

    const symbolFunctionName = symtree.members[0];

    expect(symbolFunctionName.members.length).to.equal(0);
  });

  it("should parse (this as Type) type-cast object properties correctly", function() {
    const symtree = buildSymbolTree(`
      class ClassName {
        constructor() {
          (this as any).propertyName = "dataValue";
        }
      }
    `, ".ts");

    expect(symtree.members.length).to.equal(1);
    expect(symtree.members[0].members.length).to.equal(1);
    expect(symtree.members[0].members[0].members.length).to.equal(1);

    expect(symtree.members[0].members[0].members[0].meta.object).to.equal("this");
  });

  it("should parse (this.object as Type) type-cast object properties correctly", function() {
    const symtree = buildSymbolTree(`
      class ClassName {
        constructor() {
          (this.objectName as any).propertyName = "dataValue";
        }
      }
    `, "*.ts");

    const symbolObjectName = symtree.members[0].members[0].members[0];

    expect(symbolObjectName.meta.object).to.equal("this.objectName");
  });

  it("should infer simple types", function() {
    const symtree = buildSymbolTree(`
      class ClassName {
        bool = true;
        num = 1;
        str = "string";
      }
    `, "*.ts");

    const [bool, num, str] = symtree.members[0].members;

    expect(bool.meta.dataType[0]).to.equal("boolean");
    expect(num.meta.dataType[0]).to.equal("number");
    expect(str.meta.dataType[0]).to.equal("string");
  });

  it("should parse extends, implements", function() {
    const symtree = buildSymbolTree(`
      interface IArrayBuffer extends ArrayBuffer {}
      class ArrayBufferImpl implements ArrayBuffer {}
      interface SpecializedArrayBuffer extends Special.IArrayBuffer {}
      class SpecializedArrayBufferImpl extends Special.ArrayBuffer
        implements Special.IArrayBuffer {}
    `, "*.ts");

    const [
      iarrayBuffer,
      arrayBufferImpl,
      specializedArrayBuffer,
      specializedArrayBufferImpl,
    ] = symtree.members;

    expect(iarrayBuffer.meta.extends[0]).to.equal("ArrayBuffer");
    expect(arrayBufferImpl.meta.implements[0]).to.equal("ArrayBuffer");
    expect(specializedArrayBuffer.meta.extends[0]).to.equal("Special.IArrayBuffer");
    expect(specializedArrayBufferImpl.meta.implements[0]).to.equal("Special.IArrayBuffer");
    expect(specializedArrayBufferImpl.meta.extends[0]).to.equal("Special.ArrayBuffer");
  });

  it("should work with decorators", function() {
    const symtree = buildSymbolTree(`
      class DecoratorGarden {
        @decorator({ withParam: 'some-value' })
        decorated() {

        }
      }
    `, "*.ts");

    expect(symtree.members[0].members.length).to.equal(1);
  });

  // it("should work with spread object parameters", function() {
  //   const symbolTree = buildSymbolTree(`
  //     /** Build */
  //     class Factory {
  //       /** Build with options. */
  //       build({ arg0, arg1, arg2 }: Opts) { }
  //     }
  //   `);
  //   const build = symbolTree.members[0].members[0];
  //
  //   expect(build.meta.params.length).to.equal(4);// implicit param!
  // });

  it("should work with spread tuple parameters", function() {
    const symbolTree = buildSymbolTree(`
       /** Figure it out. */
       function dynamic_call(...[a0, a1]: [string, number] | [number, string]) {
       }
    `);
    const dynamicCall = symbolTree.members[0];

    expect(dynamicCall.meta.params.length).to.equal(1);
    expect(dynamicCall.meta.params[0].identifier).to.not.equal(undefined);
    expect(dynamicCall.meta.params[0].dataType[0]).to.equal("[string, number] | [number, string]");
  });

  it("should parse type parameters", function() {
    const symbolTree = buildSymbolTree(`
      class Builder {
        /** Resources in the builder's account. */
        resources: Array<T>;
        /** Metadata */
        pairs: Map<K, V>;
      }
    `, ".ts");

    expect(symbolTree.members[0].members[0].meta.dataType[0]).to.equal("Array<T>");
    expect(symbolTree.members[0].members[1].meta.dataType[0]).to.equal("Map<K, V>");
  });

  it("should parse parameter types with default values", function() {
    const symbolTree = buildSymbolTree(`
      function mark(what: object | string = 'test') {
      }
    `);

    expect(symbolTree.members[0].meta.params[0].dataType[0]).to.equal("object | string");
  });

  it("should infer primitive parameter types", function() {
    const symbolTree = buildSymbolTree(`
      function mark(what = 'test') {
      }
    `);

    expect(symbolTree.members[0].meta.params[0].dataType[0]).to.equal("string");
  });

  it("should expand object pattern parameters", function() {
    const symbolTree = buildSymbolTree(`
      function length({ p0: { x: x0, y: y0 } }: { p0: { x: number, y: number} }) {}
    `, "*.ts");

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
    `, "*.ts");

    const lengthFn = symbolTree.members[0];

    expect(lengthFn.meta.params.length).to.equal(3);
    expect(lengthFn.meta.params[0].dataType[0]).to.equal("{ p0 : { x : number, y : number } }");
    expect(lengthFn.meta.params[1].default).to.equal("1");
    expect(lengthFn.meta.params[2].default).to.equal("2");
    expect(lengthFn.meta.params[1].dataType[0]).to.equal("number");
    expect(lengthFn.meta.params[2].dataType[0]).to.equal("number");
  });
});