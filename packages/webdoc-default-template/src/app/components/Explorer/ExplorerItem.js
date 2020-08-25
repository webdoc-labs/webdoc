import ExplorerTargetGroup from "./ExplorerCategoryItem";
import Link from "@material-ui/core/Link";
//import React from "react";
import TreeItem from "@material-ui/lab/TreeItem";
import cuid from "cuid";
import {useExplorerStyles} from "./useExplorerStyles";


export default function ExplorerItem(props) {
  if (!props.data.nodeId) {
    props.data.nodeId = cuid();
  }

  const classes = useExplorerStyles();
  const targetChildren = [];

  let i = 0;
  for (const [key, value] of Object.entries(props.data.children || {})) {
    targetChildren.push(Array.isArray(value) ?
      (<ExplorerTargetGroup key={i} title={key} data={value} />) :
      (<ExplorerItem key={i} data={value} />),
    );
    i++;
  }

  return (
    <TreeItem
      className="explorer-tree__target"
      classes={{
        label: classes.label,
        iconContainer: classes.iconContainer,
        selected: classes.selected,
      }}
      nodeId={props.data.nodeId}
      label={
        props.data.page ?
          (
            <Link classes={{root: classes.labelLinks}}
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
