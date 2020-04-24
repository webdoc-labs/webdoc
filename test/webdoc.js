const expect = require("chai").expect;
const fs = require("fs");
const path = require("path");

const {parse} = require("@webdoc/parser");
const {writeDoctree} = require("@webdoc/externalize");

describe("webdoc", function() {
  it("Documents a class and its methods, properties correctly", function() {
    return fs.readFile(
      path.join(__dirname, "/input/webdoc/TestClass.js"), "utf8", function(_, data) {
        const doctree = parse(data);
        fs.writeFileSync(path.join(__dirname, "/ref/webdoc/TestClass.json"), writeDoctree(doctree));
      });
  });
});
