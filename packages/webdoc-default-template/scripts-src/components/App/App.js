import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Content from "../Content";
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
        <Content />
      </div>
    </div>
  );
}
