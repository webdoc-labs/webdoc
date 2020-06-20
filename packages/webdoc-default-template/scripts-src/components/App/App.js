import * as React from "react";
import Explorer from "../Explorer";

export default function App() {
  return (
    <div class="app-container">
      <header class="app-header">
      </header>
      <div class="app-layout">
        <Explorer />
        <div class="content">
          <h1>
          @webdoc/default-template is in development! The example documentation is down as we are
          transitioning to this new template.
          </h1>
        </div>
      </div>
    </div>
  );
}
