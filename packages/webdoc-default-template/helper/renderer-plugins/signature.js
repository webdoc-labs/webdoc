/*::
import type {Doc} from "@webdoc/types";
*/

const {SymbolLinks} = require("@webdoc/template-library");

exports.signaturePlugin = {
  generateSignature(doc /*: Doc */) {
    const mapDocTypeToKeyboard = {
      ClassDoc: "class",
      NSDoc: "namespace",
      TypedefDoc: "typedef",
      InterfaceDoc: "interface",
    };

    let signature = "";

    if (doc.access && doc.access !== "public") {
      signature += `${doc.access} `;
    }

    if (doc.scope && doc.scope !== "instance") {
      signature += `${doc.scope} `;
    }

    if (mapDocTypeToKeyboard[doc.type]) {
      signature += `${mapDocTypeToKeyboard[doc.type]} `;
    }

    signature += (doc.name !== "constructor") ?
      doc.name :
      `new ${doc.parent.path}`;

    switch (doc.type) {
    case "MethodDoc":
    case "FunctionDoc":
      if (doc.params) {
        signature += `(${
          doc.params
            .filter((param) => !param.identifier.includes("."))
            .map((param) =>
              param.identifier +
              (param.dataType ?
                ": " + SymbolLinks.linkTo(param.dataType) :
                ""
              ),
            )
            .join(", ")
        })`;
      }
      if (doc.returns) {
        signature += ` → {${
          doc.returns
            .map((returns) =>
              (returns.dataType ? SymbolLinks.linkTo(returns.dataType) : ""))
            .join(", ")
        }} `;
      }
      break;
    case "PropertyDoc":
      if (doc.dataType) {
        signature += ": " + SymbolLinks.linkTo(doc.dataType);
      }
      break;
    case "ClassDoc":
      if (doc.extends) {
        signature += ` extends ${
          doc.extends.map((superClass) => SymbolLinks.linkTo(superClass)).join(", ")
        }`;
      }
      if (doc.implements) {
        signature += `\nimplements ${
          doc.extends.map((ifc) => SymbolLinks.linkTo(ifc)).join(", ")
        }`;
      }
      break;
    }

    return signature.trim();
  },
};
