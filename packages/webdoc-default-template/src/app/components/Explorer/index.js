import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ExplorerTarget from "./ExplorerItem";
import ExplorerTargetGroup from "./ExplorerCategoryItem";
import React from "react";
import TreeView from "@material-ui/lab/TreeView";

let fetched = false;

export default function Explorer(props) {
  const [data, setData] = React.useState(null);
  const children = [];

  if (!fetched) {
    fetch("/explorer/reference.json")
      .then((response) => {
        if (response.ok) {
          response.json().then((idata) => {
            // console.log(idata);
            setData(idata || {});
          });
        } else {
          throw new Error("Can't fetch reference.json");
        }
      })
      .catch((error) => {
        console.error("Explorer couldn't load data:", error);
      });

    fetched = true;
  }
  let i = 0;
  if (data) {
    for (const [key, value] of Object.entries(data.children || {})) {
      children.push(Array.isArray(value) ?
        (<ExplorerTargetGroup key={i} title={key} data={value} />) :
        (<ExplorerTarget key={i} data={value} />),
      );
      i++;
    }
  } else {
    children.push(<span key={++i}>Loading...</span>);
  }

  return (
    <TreeView
      className="explorer-tree"
      defaultCollapseIcon={<ArrowDropDownIcon />}
      defaultExpandIcon={<ArrowRightIcon />}
      disableSelection={true}
    >
      {children}
    </TreeView>
  );
}
