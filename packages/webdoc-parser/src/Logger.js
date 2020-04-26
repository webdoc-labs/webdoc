// @flow

import {Log, LogLevel} from "missionlog";
export {tag} from "missionlog";

export let parserLogger: Log = null;

function initLogger(defaultLevel: string = "WARN") {
  parserLogger = new Log().init(
    {
      TagParser: defaultLevel,
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
