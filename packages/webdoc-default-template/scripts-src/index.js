/** global Webdoc */
import * as React from "react";
import ReactDOM from "react-dom";

window.onload = function() {
  const templateRoot = document.getElementById("template-app");

  ReactDOM.render(
    <h1>@webdoc/default-template is now in development! The example documentation will be down for a few days as we transition to a new template!</h1>,
    templateRoot,
  );
};

console.log("ALIVE");
