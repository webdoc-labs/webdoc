const {createDoc} = require("../");

const expect = require("chai").expect;

describe("@webdoc/model/doc", function() {
  describe("createDoc", function() {
    it("should correctly infer scope from the canonical name", function() {
      const mixinMetadata = createDoc("API.MixinBase#mixinMetadata", "MemberDoc");
      const mixinState = createDoc("API.MixinBase~mixinState", "ObjectDoc");
      const mixinFactory = createDoc("API~MixinFactory.build", "MethodDoc");

      expect(mixinMetadata.scope).to.equal("instance");
      expect(mixinState.scope).to.equal("inner");
      expect(mixinFactory.scope).to.equal("static");
    });
  });
});
