
const {createPackageDoc, findDoc} = require("@webdoc/model");
const {parse} = require("../lib/parse");
const {query} = require("@webdoc/model");

const expect = require("chai").expect;

describe("@webdoc/parser.parse (Typescript)", function() {
  it("should infer access, default value, and type for fields", async function() {
    const docs = await parse([{
      content: `
        /** Example class */
        class Example {
          /**
           * Field description
           */
          protected readonly field: boolean = true;
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    expect(docs.members.length).to.equal(1);
    expect(docs.members[0].members.length).to.be.gte(1);

    const fieldDoc = docs.members[0].members[0];

    expect(fieldDoc.access).to.equal("protected");
    expect(fieldDoc.dataType && fieldDoc.dataType[0]).to.equal("boolean");
    expect(fieldDoc.defaultValue).to.equal("true");
    expect(fieldDoc.readonly).to.equal(true);

    // TODO: Fix this. No space should be there (added/not-fixed b/c this was
    // in a PR for different issue)
    expect(fieldDoc.brief).to.equal(" Field description");
  });

  it("should infer access, returns for methods", async function() {
    const docs = await parse([{
      content: `
        class Resource {
          /** Method */
          protected onPlay(): void {
            this._playing = true;
          }
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const methodDoc = findDoc("Resource.onPlay", docs);

    expect(methodDoc.name).to.equal("onPlay");
    expect(methodDoc.access).to.equal("protected");
    expect(methodDoc.returns[0].dataType[0]).to.equal("void");
  });

  it("should work with property parameters", async function() {
    const documentTree = await parse([{
      content: `
        class RedBlackTree {
          /** HERE */
          constructor(protected readonly root: Node) {}
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const rootProperty = findDoc("RedBlackTree.root", documentTree);
    const ctor = findDoc("RedBlackTree.constructor", documentTree);

    expect(rootProperty).to.not.equal(null);
    expect(rootProperty.access).to.equal("protected");
    expect(rootProperty.dataType[0]).to.equal("Node");
    expect(rootProperty.name).to.equal("root");
    expect(rootProperty.readonly).to.equal(true);

    expect(ctor).to.not.equal(null);
    expect(ctor.params.length).to.equal(1);

    const rootParameter = ctor.params[0];

    expect(rootParameter.dataType[0]).to.equal("Node");
    expect(rootParameter.identifier).to.equal("root");
  });

  it("should work with property parameter when default values are assigned", async function() {
    const documentTree = await parse([{
      content: `
        class AVLTree {
          /** HERE */
          constructor(protected root: Node = "null") {}
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const rootProperty = findDoc("AVLTree.root", documentTree);
    const ctor = findDoc("AVLTree.constructor", documentTree);

    expect(rootProperty).to.not.equal(null);
    expect(ctor).to.not.equal(null);

    expect(rootProperty.defaultValue).to.equal("\"null\"");
    expect(ctor.params[0].default).to.equal("\"null\"");
  });

  it("should work with getter-only properties", async function() {
    const documentTree = await parse([{
      content: `
        class TheEmptyList {
          /** Empty list has 0 length!  */
          get length(): number {
            return 0;
          }
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const lengthProperty = findDoc("TheEmptyList.length", documentTree);

    expect(lengthProperty).to.not.equal(null);
    expect(lengthProperty.dataType).to.not.equal(undefined);
    expect(lengthProperty.dataType[0]).to.equal("number");
  });

  it("should work with getter-setter properties", async function() {
    const documentTree = await parse([{
      content: `
        class TheEmptyList {
          /** Empty list has 0 length!  */
          get length(): number {
            return 0;
          }
          set length(value: number) {
            throw new Error('TheEmptyList will always remain empty');
          }
        }
      `,
      path: ".ts",
      package: createPackageDoc(),
    }]);

    const lengthProperty = findDoc("TheEmptyList.length", documentTree);

    expect(lengthProperty).to.not.equal(null);
    expect(lengthProperty.dataType).to.not.equal(undefined);
    expect(lengthProperty.dataType[0]).to.equal("number");
  });

  it("should properly inherit all method overloads", async function() {
    const documentTree = await parse([{
      content: `
       // Copyright (C) Matt Karl.
       // Copied from https://github.com/bigtimebuddy/webdoc-overload-bug.

       /**
        * @class
        */
       export class ParentClass {
           /**
            * Concat two strings
            * @param a - First
            * @param b - Second
            * @returns Value
            */
           add(a:string, b:string):string;
       
           /**
            * Add two numbers
            * @param a - First
            * @param b - Second
            * @returns Value
            */
           add(a:number, b:number): number;
       
           /**
            * @ignore
            */
           add(a: any, b:any): any {
               return a + b;
           }
           
           /**
            * Subtract two numbers
            * @param a - First
            * @param b - Second
            */
           sub(a:number, b:number): number {
               return a - b;
           }
           
           /**
            * Multiply two numbers
            * @param a - First
            * @param b - Second
            */
           mul(a:number, b:number): number {
               return a * b;
           }

           /**
            * Divide two numbers
            * @param a - First
            * @param b - Second
            */
           div(a:number, b:number): number {
               return a / b;
           }
       } 

       /**
        * @class
        */
       export class ChildClass extends ParentClass {
           /**
            * @override
            */
           sub(a:number, b:number): number

           /**
            * Some weird algo to subtract strings
            * @param a - First
            * @param b - Second
            */
           sub(a:string, b:string): string;
           
           /**
            * @ignore
            */
           sub(a: string | number, b: string | number): string | number { }

           /**
            * Multiply two numbers − enhanced
            * @param a - First
            * @param b - Second
            */
           mul(a:number, b:number): number {
              if (isNaN(a) || isNaN(b)) throw new Error("NaN can't be multiplied");
              
              return a * b;
           }
           
           /**
            * Divide two numbers - enhanced
            *
            * @override
            */
           div(a, b): number {
               if (b === 0) throw new Error("Can't divide by zero");

               return a / b;
           }
       }
      `,
      path: "*.ts",
      package: createPackageDoc(),
    }]);

    const parentClass = findDoc("ParentClass", documentTree);
    const childClass = findDoc("ChildClass", documentTree);

    const add = (mem) => mem.name === "add";
    const sub = (mem) => mem.name === "sub";
    const mul = (mem) => mem.name === "mul";
    const div = (mem) => mem.name === "div";

    expect(parentClass.members.filter(add).length).to.equal(2);
    expect(childClass.members.filter(add).length).to.equal(2);

    expect(parentClass.members.filter(sub).length).to.equal(1);
    expect(childClass.members.filter(sub).length).to.equal(2);
    expect(
      query("ChildClass#sub[params[0][dataType] = string]", documentTree)[0]
        .overrides,
    ).to.equal(undefined);
    expect(
      query("ChildClass#sub[params[0][dataType] = number]", documentTree)[0]
        .overrides.params[0].dataType[0],
    ).to.equal("number");

    expect(parentClass.members.filter(mul).length).to.equal(1);
    expect(childClass.members.filter(mul).length).to.equal(1);
    expect(childClass.members.filter(mul)[0].overrides).to.not.equal(undefined);

    expect(parentClass.members.filter(div).length).to.equal(1);
    expect(childClass.members.filter(div)[0].overrides).to.not.equal(undefined);
  });
});
