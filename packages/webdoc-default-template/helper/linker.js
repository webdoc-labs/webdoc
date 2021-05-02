const {LinkerPlugin} = require("@webdoc/template-library");
const linker = new LinkerPlugin();

exports.linker = linker;

exports.prepareLinker = async function(config) {
  linker.siteRoot = config.template.siteRoot;

  if (Array.isArray(config.opts.import)) {
    for (const importUri of config.opts.import) {
      await linker.loadDocumentedInterface(importUri);
    }
  }
};
