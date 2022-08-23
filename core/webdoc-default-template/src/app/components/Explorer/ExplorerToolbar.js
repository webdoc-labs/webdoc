import IconButton from "@material-ui/core/IconButton";
import {PAGE_SETTINGS} from "../../../protocol";
// eslint-disable-next-line no-unused-vars
import React from "react";
import SettingsIcon from "@material-ui/icons/Settings";

const toolbarStyle = {
  borderTop: "1px solid rgba(0, 0, 0, 0.04)",
  display: "flex",
  padding: "8px",
};

export default function ExplorerToolbar() {
  return (
    <div style={toolbarStyle}>
      <IconButton
        as="a"
        href={PAGE_SETTINGS}
        size="small"
      >
        <SettingsIcon />
      </IconButton>
    </div>
  );
}
