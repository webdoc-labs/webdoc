/** global Webdoc */
import * as React from "react";
import ReactDOM from "react-dom";

window.onload = function() {
  const templateRoot = document.getElementById("template-app");


  fetch("explorer/reference.json").then((response) => {
    if (response.ok) {
      response.json().then((data) => console.log(data));
    } else {
      console.log("ERROR");
    }
  });

  ReactDOM.render(
    <h1>@webdoc/default-template is now in development! The example documentation will be down for a few days as we transition to a new template!</h1>,
    templateRoot,
  );
};

console.log("ALIVE");
