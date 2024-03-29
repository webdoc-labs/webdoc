import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ExplorerFilter from "./ExplorerFilter";
import ExplorerHeader from "./ExplorerHeader";
import ExplorerTarget from "./ExplorerItem";
import ExplorerTargetGroup from "./ExplorerCategoryItem";
import ExplorerToolbar from "./ExplorerToolbar";
import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import {connect} from "react-redux";
import cuid from "cuid";
import {isSamePage} from "./helpers";
import store from "../../store";
import {useExplorerStyles} from "./useExplorerStyles";

let fetched = false;

function makeIds(data, collector) {
  data.$nodeId = cuid();

  let shouldBeExpanded = false;

  if (data.page) {
    shouldBeExpanded = isSamePage(data);
  }

  if (data.children) {
    for (const [, value] of Object.entries(data.children)) {
      const childExpanded = makeIds(value, collector);

      if (childExpanded) {
        collector.add(data.$nodeId);
        shouldBeExpanded = true;
      }
    }
  }
  if (shouldBeExpanded) {
    collector.add(data.$nodeId);
  }

  return shouldBeExpanded;
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
  setAutoScrollTo: (value) => store.dispatch({
    type: "setAutoScrollTo",
    value,
  }),
  setExpandedItems: (value) => store.dispatch({
    type: "setExpandedItems",
    value,
  }),
  toggleItem: (nodeId, optValue) => store.dispatch({
    type: "toggleItem",
    nodeId,
    value: optValue,
  }),
}))(function Explorer({
  isOpen,
  expandedItems,
  setExpandedItems,
  toggleItem,
  rootRef,
}) {
  const [data, setData] = React.useState(null);
  const [autoScrollTo, setAutoScrollTo] = React.useState(null);
  const {root} = useExplorerStyles();
  const children = [];
  const explorerTree = window.appData.explorerTree;

  if (!fetched) {
    fetch(explorerTree)
      .then((response) => {
        if (response.ok) {
          response.json().then((idata) => {
            const defaultExpanded = new Set();

            makeIds(idata, defaultExpanded);
            setData(idata || {});
            setAutoScrollTo(defaultExpanded.values().next().value);
            setExpandedItems(defaultExpanded);
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

  React.useEffect(
    () => {
      setTimeout(
        () => {
          const scrollEl = rootRef.current.querySelector(".MuiTreeView-root");
          const toEl = document.getElementById(autoScrollTo);

          if (scrollEl && toEl) {
            const rect = toEl.getBoundingClientRect();

            scrollEl.scrollTo({
              left: rect.left,
              top: rect.top - 124,
              behavior: "smooth",
            });
          }
        },
        400,
      );
    },
    [autoScrollTo],
  );

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
      <ExplorerToolbar />
    </div>
  );
});

export {ExplorerHeader};
