import React from "react";
import {getResourceURI} from "../../../protocol";

export default function Search({
  integration,
}) {
  const ref = React.useRef(null);
  const enabled = React.useRef(false);

  React.useEffect(
    () => {
      if (!ref.current || enabled.current) {
        console.log("Input not found for search");
        return;
      }
      if (integration.provider === "algolia") {
        if (!window.docsearch) {
          throw new Error("docsearch should be in global scope");
        }

        console.log("Initializing search");

        window.docsearch({
          apiKey: integration.apiKey,
          appId: integration.appId,
          indexName: integration.indexName,
          inputSelector: "#search",
          debug: false,
        });

        enabled.current = true;
      }
    },
    [ref.current],
  );

  return (
    <div
      ref={ref}
      className="search-container"
      style={{
        display: "grid",
      }}
    >
      <input
        id="search"
        placeholder="Search"
        style={{
          backgroundColor: "#FBFBFB",
          border: "1px solid rgba(0, 0, 0, .04)",
          borderRadius: 4,
          color: "rgba(0, 0, 0, 0.34)",
          display: "flex",
          fontSize: "12px",
          height: "32px",
          paddingLeft: "18px",
          width: "240px",
        }}
      />
      <img
        src={getResourceURI("/icons/search.svg")}
        style={{
          alignSelf: "center",
          justifySelf: "end",
          marginTop: 2,
          marginRight: 9,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    </div>
  );
}
