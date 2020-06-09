const {buildSymbolTree} = require("../lib/parse");
const {assemble} = require("../lib/assembler/assemble");
const {findSymbol} = require("../lib/types/Symbol");

const expect = require("chai").expect;

describe("@webdoc/parser.LanguageIntegration{@lang ts}", function() {
  it("should parse classes correctly", function() {
    let symtree = buildSymbolTree(`
      class ClassName {
        private initProperty: number;

        constructor() {
          /**
           * This is a property whose data-type & access should be inferred.
           * @default 9
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
    expect(symbolInitProperty.comment).to.not.equal("");
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
});
