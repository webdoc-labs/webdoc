/** global Webdoc */
import * as React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Explorer from "./components/Explorer";
import Typography from "@material-ui/core/Typography";

window.onload = function() {
  const appBarRoot = document.getElementById("app-bar-root");
  const explorerRoot = document.getElementById("explorer-root");

  ReactDOM.render(
    <AppBar>
      <Toolbar>
        <Typography variant="h6">
        @webdoc/example
        </Typography>
      </Toolbar>
    </AppBar>,
    appBarRoot);
  ReactDOM.render(<Explorer />, explorerRoot);
};
