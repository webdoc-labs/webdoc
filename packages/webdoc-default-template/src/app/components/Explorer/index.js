import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import ExplorerHeader from "./ExplorerHeader";
import ExplorerTarget from "./ExplorerItem";
import ExplorerTargetGroup from "./ExplorerCategoryItem";
import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import {connect} from "react-redux";
import store from "../../store";
import {useExplorerStyles} from "./useExplorerStyles";

let fetched = false;

export default connect(({explorerOpen}) => ({
  isOpen: explorerOpen,
  setOpen: (isOpen) => store.dispatch({type: "setExplorerOpen", value: isOpen}),
}))(function Explorer({
  isOpen,
  setOpen,
}) {
  const [data, setData] = React.useState(null);
  const {root} = useExplorerStyles();
  const toggleOpen = React.useCallback(() => setOpen(!isOpen), [isOpen]);
  const children = [];

  if (!fetched) {
    fetch("/" + window.appData.siteRoot + "/explorer/reference.json")
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
    <div className="explorer" style={{
      display: !isOpen ? "none" : undefined,
      minWidth: !isOpen ? "0px" : undefined,
      width: !isOpen ? "0px" : undefined,
      overflowX: !isOpen ? "hidden" : undefined,
    }}>
      <ExplorerHeader isOpen={isOpen} toggleOpen={toggleOpen} />
      <TreeView
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
