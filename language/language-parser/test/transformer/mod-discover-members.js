// @flow

import {addChildDoc, createDoc, createRootDoc} from "@webdoc/model";
import {describe, it} from "mocha";
import discover from "../../src/transformer/mod-discover-members";
import {expect} from "chai";

describe("mod-discover-members", function() {
  it("should not fail when an interface is implicitly implemented twice", function() {
    const interfaceA = createDoc("A", "InterfaceDoc");
    const classB = createDoc("B", "ClassDoc", {
      implements: [interfaceA],
    });
    const classC = createDoc("C", "ClassDoc", {
      extends: [classB],
      implements: [interfaceA],
    });
    const documentTree = createRootDoc();

    addChildDoc(classC, documentTree);
    addChildDoc(classB, documentTree);
    addChildDoc(interfaceA, documentTree);

    expect(() => discover(documentTree)).to.not.throw();
  });
});
