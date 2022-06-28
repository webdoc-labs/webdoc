const {SymbolLinks} = require("@webdoc/template-library");

// Used for building signature strings for documented methods, properties.
exports.SignatureBuilder = {
  needsSignature(doc /*: Doc */) /*: boolean */ {
    // Functions, methods, and properties always have signatures.
    if (doc.type === "FunctionDoc" || doc.type === "MethodDoc") {
      return true;
    }
    // Class constructors documented as classes have signatures.
    if (doc.type === "ClassDoc" && doc.params) {
      return true;
    }
    // Typedefs on functions have signatures.
    if (doc.type === "TypedefDoc" && (doc.params || doc.returns)) {
      return true;
    }

    return false;
  },
  appendParameters(doc /*: Doc */) {
    if (!doc.params) {
      return;
    }

    const paramTypes = doc.params
      .filter((param) => param.identifier && !param.identifier.includes("."))
      .map(
        (item) => {
          let attributes = [];
          let itemName = item.identifier || "";

          if (item.optional) {
            attributes.push("opt");
          }

          if (item.nullable === true) {
            attributes.push("nullable");
          } else if (item.nullable === false) {
            attributes.push("non-null");
          }

          attributes = attributes.join(", ");

          if (item.variadic) {
            itemName = `&hellip;${itemName}`;
          }

          if (attributes && attributes.length) {
            itemName = `${itemName}<span class="signature-attributes">${attributes}</span>`;
          }

          return itemName;
        });

    const paramTypesString = paramTypes.join(", ");

    doc.signature = `${doc.signature || ""}(${paramTypesString})`;
  },
  appendReturns(doc /*: Doc */) {
    const returns = doc.returns || doc.yields;

    if (!returns) {
      return;
    }

    const returnTypes = [];

    for (let i = 0, j = returns.length; i < j; i++) {
      returnTypes[i] = SymbolLinks.linkTo(returns[i].dataType);
    }

    const returnTypesString = returnTypes.join(" | ");

    doc.signature =
          `<span class="signature">${doc.signature || ""}</span>` +
          `<span class="type-signature">  →  {${returnTypesString}}</span>`;
  },
  appendTypes(doc /*: Doc */) {
    if (!doc.dataType) {
      return;
    }

    const typeString = SymbolLinks.linkTo(doc.dataType);

    doc.signature =
          `${doc.signature || ""}` +
          ` : <span class="type-signature">${typeString}</span>`;
  },
};
