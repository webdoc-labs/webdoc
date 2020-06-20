import * as React from "react";
import type {ExplorerTargetData} from "./ExplorerTargetData";
import ExplorerTargetGroup from "./ExplorerCategoryItem";
import Link from "@material-ui/core/Link";
import TreeItem from "@material-ui/lab/TreeItem";
import cuid from "cuid";
import {useExplorerStyles} from "./useExplorerStyles";

type ExplorerTargetProps = {
  currentTarget: string,
  data: ExplorerTargetData,
}

export default function ExplorerItem(props: ExplorerTargetProps) {
  if (!props.data.nodeId) {
    props.data.nodeId = cuid();
  }

  const classes = useExplorerStyles();
  const targetChildren = [];

  for (const [key, value] of Object.entries(props.data.children || {})) {
    if (Array.isArray(value)) {
      targetChildren.push(<ExplorerTargetGroup title={key} data={value} />);
    } else {
      targetChildren.push(<ExplorerItem data={value} />);
    }
  }

  return (
    <TreeItem className="explorer-target"
      classes={{
        label: classes.label,
        iconContainer: classes.iconContainer,
        selected: classes.selected,
      }}
      nodeId={props.data.nodeId}
      label={
        props.data.page ?
          <Link classes={{root: classes.labelLinks}}
            href={props.data.page}
            underline="hover"
          >
            {props.data.title}
          </Link> :
          props.data.title
      }
    >
      {targetChildren}
    </TreeItem>
  );
}
