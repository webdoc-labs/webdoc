// @flow

import {APP_NAME, webdocDB, webdocService} from "../../protocol";
import React from "react";
import type {SettingsData} from "../../protocol";

export function useSettings(db: ?webdocDB, service: ?webdocService): {
  settings: ?SettingsData,
  refresh: () => void,
  mutate: (data: $Shape<SettingsData>) => void
} {
  const [settings, setSettings] = React.useState<?SettingsData>(null);
  const refresh = React.useCallback(() => {
    if (!db) return;
    db.settings.get(APP_NAME).then(setSettings);
  }, [db]);
  const mutate = React.useCallback((data: $Shape<SettingsData>) => {
    if (!db || !service) return;
    db.settings.update(APP_NAME, data).then(refresh);
    Object.entries(data).forEach(([key, value]) => {
      service.postMessage({
        type: "trigger:settings",
        app: APP_NAME,
        change: {
          key, value,
        },
      });
    });
  }, [db, service]);

  React.useEffect(refresh, [refresh]);

  return {
    settings,
    refresh,
    mutate,
  };
}
