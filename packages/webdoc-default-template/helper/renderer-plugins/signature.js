/*::
import type {Doc} from "@webdoc/types";
*/

const {SymbolLinks} = require("@webdoc/template-library");

exports.signaturePlugin = {
  DOC_TYPE_TO_KEYWORD: {
    "ClassDoc": "class",
    "NSDoc": "namespace",
    "TypedefDoc": "typedef",
    "InterfaceDoc": "interface",
  },
  generateSignature(doc /*: Doc */, codeClasses = "") {
    let signature = "";

    if (doc.access && doc.access !== "public") {
      signature += `${doc.access} `;
    }
    if (doc.scope && doc.scope !== "instance") {
      signature += `${doc.scope} `;
    }

    if (this.DOC_TYPE_TO_KEYWORD[doc.type]) {
      signature += this.DOC_TYPE_TO_KEYWORD[doc.type] + " ";
    }

    if (doc.name !== "constructor") {
      signature += doc.name;
    } else {
      signature += "new " + doc.parent.path;
    }

    if (doc.type === "MethodDoc" || doc.type === "FunctionDoc") {
      if (doc.params) {
        signature += `(${
          doc.params
            .filter((param) => !param.identifier.includes("."))
            .map((param) =>
              param.identifier +
              (param.dataType ? ": " + SymbolLinks.linkTo(param.dataType) : ""))
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
    } else if (doc.type === "PropertyDoc") {
      if (doc.dataType) {
        signature += ": " + SymbolLinks.linkTo(doc.dataType);
      }
    } else if (doc.type === "ClassDoc") {
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
    }

    signature = `<code class="${codeClasses}">${signature}</code>`;
    signature = signature.replace(/\n/g, `</code><br /><code class="${codeClasses}">`);

    return signature;
  },
};
