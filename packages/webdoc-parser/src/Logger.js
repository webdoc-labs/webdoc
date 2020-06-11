// @flow

import {Log, LogLevel} from "missionlog";
export {tag} from "missionlog";

type ParserStage = "Symbol-Parser" | "Assembler" | "Transformer" | "Document-Tree-Modifier";

let stage: ParserStage = "Symbol-Parser";
let doc: string;

export function updateStage(newStage: ParserStage) {
  stage = newStage;
}

export function updateDocument(canonicalName: string) {
  doc = canonicalName;
}

const logContextProviders = {
  TagParser(tagPrefix: string): string {
    return tagPrefix + `{@${doc}}`;
  },
};

export let parserLogger: Log = null;

export function initLogger(defaultLevel: string = "INFO") {
  parserLogger = new Log().init(
    {
      Assembly: defaultLevel,
      TagParser: defaultLevel,
      PartialParser: defaultLevel,
      DocParser: defaultLevel,
      DocumentTreeModifier: defaultLevel,
    },
    (level, tag, msg, params) => {
      let tagPrefix = `[${tag}]:`;

      if (logContextProviders[tag]) {
        tagPrefix = logContextProviders[tag](tagPrefix);
      }

      switch (level) {
      case LogLevel.ERROR:
        console.error(tagPrefix, msg, ...params);
        break;
      case LogLevel.WARN:
        console.warn(tagPrefix, msg, ...params);
        break;
      case LogLevel.INFO:
        console.info(tagPrefix, msg, ...params);
        break;
      default:
        console.log(tagPrefix, msg, ...params);
        break;
      }
    });
}

initLogger("WARN");
