import {
  useExplorerCategoryStyles,
  useExplorerPrimaryItemStyles,
  useExplorerStyles,
} from "./useExplorerStyles";
import ExplorerCategoryItem from "./ExplorerCategoryItem";
import Link from "@material-ui/core/Link";
import React from "react";
import TreeItem from "@material-ui/lab/TreeItem";
import {isSamePage} from "./helpers";

export default function ExplorerItem(props) {
  if (!props.data.$nodeId) {
    throw new Error("Ids must be assigned");
  }

  const classesItem = useExplorerStyles();
  const classesCategory = useExplorerCategoryStyles();
  const classesPrimaryItem = useExplorerPrimaryItemStyles();
  const targetChildren = [];

  let i = 0;
  for (const [key, value] of Object.entries(props.data.children || {})) {
    targetChildren.push(Array.isArray(value) ?
      (<ExplorerCategoryItem key={i} title={key} data={value} toggle={props.toggle} />) :
      (<ExplorerItem key={i} data={value} toggle={props.toggle} />),
    );
    i++;
  }

  const classes = i > 0 ? classesCategory : classesItem;
  const nodeId = props.data.$nodeId;
  const primary = props.data.page && isSamePage(props.data);

  const toggle = React.useCallback(
    () => props.toggle(nodeId),
    [nodeId],
  );

  if (props.data.title !== "(overview)" && props.data.$match === false) {
    return null;
  }

  return (
    <TreeItem
      id={props.data.$nodeId}
      className="explorer-tree__target"
      classes={{
        label: classes.label,
        iconContainer: classes.iconContainer,
        selected: classes.selected,
      }}
      onClick={toggle}
      nodeId={nodeId}
      label={
        props.data.page ?
          (
            <Link classes={{root: primary ? classesPrimaryItem.labelLinks : classes.labelLinks}}
              href={props.data.page}
              underline="hover"
            >
              {props.data.title}
            </Link>
          ) :
          props.data.title
      }
    >
      {targetChildren}
    </TreeItem>
  );
}
