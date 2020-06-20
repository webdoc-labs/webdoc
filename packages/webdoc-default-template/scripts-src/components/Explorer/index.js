// @flow

import * as React from "react";
import ExplorerTarget from "./ExplorerTarget";
import ExplorerTargetGroup from "./ExplorerTargetGroup";
import type {ExplorerTargetData} from "./ExplorerTargetData";

export type ExplorerProps = {
  data: ExplorerTargetData;
};

let fetched = false;

export default function Explorer(props: ExplorerProps) {
  const [data, setData] = React.useState(null);
  const children = [];

  if (!fetched) {
    fetch("explorer/reference.json").then((response) => {
      if (response.ok) {
        response.json().then((idata) => {
          console.log(idata);
          setData(idata || {});
        });
      } else {
        console.error("Explorer couldn't load data");
      }
    });

    fetched = true;
  }

  if (data) {
    for (const [key, value] of Object.entries(data.children)) {
      if (Array.isArray(value)) {
        children.push(<ExplorerTargetGroup title={key} data={value} />);
      } else {
        children.push(<ExplorerTarget data={value} />);
      }
    }
  } else {
    children.push(<span>Loading</span>);
  }

  return (
    <nav className="explorer">
      <section className="explorer-children" style={{paddingLeft: 0}}>
        {children}
      </section>
    </nav>
  );
}
