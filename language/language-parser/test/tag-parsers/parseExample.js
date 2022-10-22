// @flow

import {describe, it} from "mocha";
import {expect} from "chai";
import {parseExample} from "../../src/tag-parsers";

describe("@webdoc/parser.parseExample", function() {
  it("should trim out blank lines at the start and end of a snippet", function() {
    const snippetTrimmed =
`class Main {
  public static main(): void {
    console.log('Hello world!');
  }
}`;
    const snippet =
`


${snippetTrimmed}

`;
    const examples = [];
    parseExample(snippet, {examples});

    expect(examples[0].code).to.equal(snippetTrimmed);
  });

  it("should trim out intrinsic indent in example snippets", function() {
    const snippetTrimmed =
`class Main {
  public static main(): void {
    console.log('Hello world!');
  }
}`;
    const snippet = snippetTrimmed
      .split("\n")
      .map((line) => "  " + line)
      .join("\n");
    const examples = [];
    parseExample(snippet, {examples});

    expect(examples[0].code).to.equal(snippetTrimmed);
  });
});
