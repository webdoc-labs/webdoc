/*::
import type {Doc} from "@webdoc/types";
*/

const {linker} = require("../linker");

exports.signaturePlugin = {
  generateSignature(doc /*: Doc */, options = {} /*: { noTail: boolean } */) {
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
                ": " + linker.linkTo(param.dataType, undefined, {htmlSafe: false}) :
                ""
              ),
            )
            .join(", ")
        })`;
      }
      if (!options.noTail && doc.returns) {
        signature += ` → {${
          (doc.returns || [])
            .map((returns) => (returns.dataType ?
              linker.linkTo(returns.dataType, undefined, {htmlSafe: false}) :
              ""))
            .join(", ")
        }} `;
      }
      break;
    case "PropertyDoc":
      if (!options.noTail && doc.dataType) {
        signature += ": " + linker.linkTo(doc.dataType, undefined, {htmlSafe: false});
      }
      if (doc.defaultValue) {
        signature += " = " + doc.defaultValue;
      }
      break;
    case "ClassDoc":
      if (doc.extends) {
        signature += ` extends ${
          (doc.extends || [])
            .map((superClass) => linker.linkTo(superClass, undefined, {htmlSafe: false})).join(", ")
        }`;
      }
      if (doc.implements) {
        signature += `\nimplements ${
          (doc.implements || [])
            .map((ifc) => linker.linkTo(ifc, undefined, {htmlSafe: false})).join(", ")
        }`;
      }
      break;
    }

    signature = signature.trim();
    signature = signature
      .replace(/&/g, "&amp;")
      .replace(/<(?![a ]|[/a])/g, "&lt;");// replace html <> arrows unless for <a>,</a> tags

    return signature;
  },
};
