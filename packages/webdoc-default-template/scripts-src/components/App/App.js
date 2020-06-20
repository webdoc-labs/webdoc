import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Explorer from "../Explorer";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

export default function App() {
  return (
    <div className="app-container">
      <AppBar>
        <Toolbar>
          <Typography variant="h6">
            @webdoc/example
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="app-layout">
        <Explorer />
        <div className="content">
          <h1>
          @webdoc/default-template is in development! The example documentation is down as we are
          transitioning to this new template.
          </h1>
        </div>
      </div>
    </div>
  );
}
