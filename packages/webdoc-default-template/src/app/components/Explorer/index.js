// @flow

import * as React from "react";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ExplorerTarget from "./ExplorerItem";
import type {ExplorerTargetData} from "./ExplorerTargetData";
import ExplorerTargetGroup from "./ExplorerCategoryItem";
import TreeView from "@material-ui/lab/TreeView";

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
      <TreeView
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        disableSelection={true}
      >
        {children}
      </TreeView>
    </nav>
  );
}
