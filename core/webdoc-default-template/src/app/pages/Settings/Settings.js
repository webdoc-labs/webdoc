// @flow

import type {ChangeEvent} from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import React from "react";
import Switch from "@material-ui/core/Switch";
import {connect} from "react-redux";
import {useSettings} from "../../hooks/useSettings";

export default connect(({database, service}) => ({
  database,
  service,
}))(function Settings({
  database,
  service,
}) {
  const {settings, mutate} = useSettings(database, service);
  const onChangeOfflineStorage = React.useCallback((e: ChangeEvent<HTMLInputElement>) => {
    mutate({offlineStorage: e.target.checked});
  }, [mutate]);

  return (
    <div>
      <h2>Site Settings</h2>
      <FormGroup>
        <FormControlLabel
          label={
            <>
              Enable offline storage
              <br />
              <FormLabel>
                Allow documentation to be downloaded for offline access.
              </FormLabel>
            </>
          }
          control={
            <Switch
              checked={settings && settings.offlineStorage}
              disabled={!database || !service}
              onChange={onChangeOfflineStorage}
            />
          }
        />
      </FormGroup>
    </div>
  );
});
