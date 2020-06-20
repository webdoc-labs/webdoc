/** global Webdoc */
import * as React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

window.onload = function() {
  const templateRoot = document.getElementById("template-app");

  ReactDOM.render(<App />, templateRoot);
};
