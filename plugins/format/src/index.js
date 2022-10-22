// @flow

import type {Doc} from "@webdoc/types";
import {traverse} from "@webdoc/model";

function repeatTabs(n: number): string {
  let str = "";
  for (let i = 0; i < n; i++) {
    str += "\t";
  }

  return str;
}

function formatDataType(dataType: string): string {
  if (dataType.length < 40) return dataType;

  let formatted = "";
  let indent = 0;
  let lineStart = true;
  for (let i = 0; i < dataType.length; i++) {
    const ch = dataType.charAt(i);
    switch (ch) {
    case "{":
      formatted += "{\n";
      indent++;
      formatted += repeatTabs(indent);
      lineStart = true;
      break;
    case "}":
      indent--;
      formatted += `\n${repeatTabs(indent)}}`;
      if (dataType.charAt(i + 1) === ",") {
        formatted += ",";
        i++;
      }
      formatted += "\n" + repeatTabs(indent);
      lineStart = true;
      break;
    case ",":
      formatted += ",\n" + repeatTabs(indent);
      lineStart = true;
      break;
    default:
      if (lineStart && ch === " ") continue;
      lineStart = false;
      formatted += ch;
    }
  }

  return formatted;
}

function format(doc: Doc): void {
  const dataType = doc.type === "TypedefDoc" && "dataType" in doc ? doc.dataType : null;
  if (dataType && dataType.length > 0) {
    dataType[0] = formatDataType(dataType[0]);
    dataType.template = formatDataType(dataType.template);
  }
}

function main() {
  global.Webdoc.Parser.installPlugin({
    id: "@webdoc/plugin-format",
    onLoad() {
      // STAGE_FINISHED
      global.Webdoc.Parser.installDoctreeMod(
        "@webdoc/plugins-format",
        400,
        function formatRecursive(rootDoc) {
          traverse(rootDoc, format);
        },
      );
    },
  });
}

main();
