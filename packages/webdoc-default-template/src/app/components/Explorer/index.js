import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ExplorerFilter from "./ExplorerFilter";
import ExplorerHeader from "./ExplorerHeader";
import ExplorerTarget from "./ExplorerItem";
import ExplorerTargetGroup from "./ExplorerCategoryItem";
import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import {connect} from "react-redux";
import cuid from "cuid";
import store from "../../store";
import {useExplorerStyles} from "./useExplorerStyles";

let fetched = false;

function makeIds(data) {
  data.$nodeId = cuid();

  if (data.children) {
    for (const [, value] of Object.entries(data.children)) {
      makeIds(value);
    }
  }
}

export default connect(({
  expandedItems,
  explorerOpen,
  query,
}) => ({
  isOpen: explorerOpen,
  query, /* Added for re-rendering when query updates */
  setOpen: (isOpen) => store.dispatch({
    type: "setExplorerOpen",
    value: isOpen,
  }),
  expandedItems: Array.from(expandedItems),
  toggleItem: (nodeId, optValue) => store.dispatch({
    type: "toggleItem",
    nodeId,
    value: optValue,
  }),
}))(function Explorer({
  isOpen,
  setOpen,
  expandedItems,
  toggleItem,
}) {
  const [data, setData] = React.useState(null);
  const {root} = useExplorerStyles();
  const toggleOpen = React.useCallback(() => setOpen(!isOpen), [isOpen]);
  const children = [];
  const sitePrefix = window.appData.siteRoot ? "/" + window.appData.siteRoot + "/" : "/";

  if (!fetched) {
    fetch(sitePrefix + "explorer/reference.json")
      .then((response) => {
        if (response.ok) {
          response.json().then((idata) => {
            makeIds(idata);
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
      if (value.$match === false) {
        continue;
      }

      children.push(Array.isArray(value) ?
        (<ExplorerTargetGroup key={i} title={key} data={value} toggle={toggleItem} />) :
        (<ExplorerTarget key={i} data={value} toggle={toggleItem} />),
      );
      i++;
    }
  } else {
    children.push(<span key={++i}>Loading...</span>);
  }

  return (
    <div className="explorer" style={{
      transition: "margin-left 200ms, width 200ms",
      transform: "matrix(1, 0, 0, 1, 0, 0)",
      ...(!isOpen && {
        marginLeft: "-291px",
        minWidth: 0,
        width: 291,
        overflowX: "hidden",
      }),
    }}>
      <ExplorerHeader isOpen={isOpen} toggleOpen={toggleOpen} />
      {data && <ExplorerFilter data={data} />}
      <TreeView
        expanded={expandedItems}
        className={"explorer__tree " + (
          isOpen ? "explorer__tree-open" : "explorer__tree-open"
        )}
        classes={{
          root,
        }}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        disableSelection={true}
      >
        {children}
      </TreeView>
    </div>
  );
});

export {ExplorerHeader};
