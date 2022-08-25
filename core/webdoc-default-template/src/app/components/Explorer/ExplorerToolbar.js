import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import {PAGE_SETTINGS} from "../../../protocol";
// eslint-disable-next-line no-unused-vars
import React from "react";
import ReactDOM from "react-dom";
import SettingsIcon from "@material-ui/icons/Settings";
import Snackbar from "@material-ui/core/Snackbar";
import {connect} from "react-redux";

const toolbarStyle = {
  borderTop: "1px solid rgba(0, 0, 0, 0.04)",
  display: "flex",
  padding: "8px",
};

export default connect(({offline, stale}) => ({offline, stale}))(function ExplorerToolbar({
  offline,
  stale,
}) {
  return (
    <div style={toolbarStyle}>
      <IconButton
        as="a"
        href={PAGE_SETTINGS}
        size="small"
      >
        <SettingsIcon />
      </IconButton>
      {offline ? (
        ReactDOM.createPortal(
          <Snackbar open={true}>
            <Alert severity="info">
              This page was served from your offline cache.
            </Alert>
          </Snackbar>,
          document.body)
      ) : stale ? (
        ReactDOM.createPortal(
          <Snackbar open={true}>
            <Alert severity="warning">
                This page has been updated. Please reload.
            </Alert>
          </Snackbar>,
          document.body)
      ) : null}
    </div>
  );
});
