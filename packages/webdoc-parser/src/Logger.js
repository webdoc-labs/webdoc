// @flow

import {Log, LogLevel} from "missionlog";
export {tag} from "missionlog";

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
      tag = `[${tag}]:`;
      switch (level) {
      case LogLevel.ERROR:
        console.error(tag, msg, ...params);
        break;
      case LogLevel.WARN:
        console.warn(tag, msg, ...params);
        break;
      case LogLevel.INFO:
        console.info(tag, msg, ...params);
        break;
      default:
        console.log(tag, msg, ...params);
        break;
      }
    });
}

initLogger();
