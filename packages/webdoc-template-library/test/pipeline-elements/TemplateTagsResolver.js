const {LinkerPlugin} = require("../../lib/template-plugins/LinkerPlugin");
const {TemplateTagsResolver} = require("../../lib/pipeline-elements/TemplateTagsResolver");
const {TemplateRenderer} = require("../../lib/TemplateRenderer");

const expect = require("chai").expect;

describe("@webdoc/template-library.TemplateTagsResolver", function() {
  const mockTagsResolver = new TemplateTagsResolver();
  const mockTemplateRenderer = new TemplateRenderer();

  mockTemplateRenderer.installPlugin("linker", LinkerPlugin);
  mockTagsResolver.attachTo({renderer: mockTemplateRenderer});

  it("{@link <DOC_PATH>}", function() {
    expect(mockTagsResolver.runLink("--{@link <DOC_PATH>}--"))
      .to.equal("--<DOC_PATH>--");
  });

  it("{@link <DOC_PATH> <NAME>}", function() {
    expect(mockTagsResolver.runLink("--{@link <DOC_PATH> <NAME>}--"))
      .to.equal("--<NAME>--");
  });

  it("{@link <DOC_PATH>|<NAME>}", function() {
    expect(mockTagsResolver.runLink("--{@link <DOC_PATH>|<NAME>}--"))
      .to.equal("--<NAME>--");
  });

  it("{@link https://github.com/webdoc-js/webdoc}", function() {
    expect(mockTagsResolver.runLink("--{@link https://github.com/webdoc-js/webdoc}--"))
      .to.equal("--<a href=\"https://github.com/webdoc-js/webdoc\">" +
        "https://github.com/webdoc-js/webdoc</a>--");
  });

  it("{@link https://github.com/webdoc-js/webdoc|LINK_NAME}", function() {
    expect(mockTagsResolver.runLink("--{@link https://github.com/webdoc-js/webdoc|LINK_NAME}--"))
      .to.equal("--<a href=\"https://github.com/webdoc-js/webdoc\">" +
        "LINK_NAME</a>--");
  });

  it("{@link https://github.com/webdoc-js/webdoc LINK NAME}", function() {
    expect(mockTagsResolver.runLink("--{@link https://github.com/webdoc-js/webdoc LINK NAME}--"))
      .to.equal("--<a href=\"https://github.com/webdoc-js/webdoc\">" +
        "LINK NAME</a>--");
  });

  it("[LINK_TEXT]{@link DOC_PATH}", function() {
    expect(mockTagsResolver.runLink("--[LINK_TEXT]{@link <DOC_PATH>}--"))
      .to.equal("--LINK_TEXT--");
  });

  it("[LINK_TEXT]{@link https://github.com/webdoc-js/webdoc}", function() {
    expect(mockTagsResolver.runLink("--[LINK_TEXT]{@link https://github.com/webdoc-js/webdoc}--"))
      .to.equal("--<a href=\"https://github.com/webdoc-js/webdoc\">" +
        "LINK_TEXT</a>--");
  });
});
