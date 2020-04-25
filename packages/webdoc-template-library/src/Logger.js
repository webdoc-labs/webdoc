// @flow

import {Log, LogLevel} from "missionlog";
export {tag} from "missionlog";

/**
 * This is the logger for the template library.
 *
 * @type {module:missionlog.Log}
 */
export let templateLogger: Log = null;

/**
 * Initializes the {@code templateLogger} to log at the given level and above. By default, only
 * warning & errors are logged.
 *
 * The following tags are used:
 *
 * + {@code TemplateLibrary}
 *
 * @param {string}[defaultLevel="WARN"]
 */
export function initTemplateLogger(defaultLevel: string = "INFO") {
  templateLogger = new Log().init(
    {
      TemplateLibrary: defaultLevel,
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

initTemplateLogger();
