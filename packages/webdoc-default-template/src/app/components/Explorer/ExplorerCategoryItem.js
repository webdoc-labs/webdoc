import ExplorerItem from "./ExplorerItem";
import type {ExplorerTargetData} from "./ExplorerTargetData";
import TreeItem from "@material-ui/lab/TreeItem";
import cuid from "cuid";
import {useExplorerStyles} from "./useExplorerStyles";

export type ExplorerTargetGroupProps = {
  title: string,
  data: ExplorerTargetData[]
}

export default function ExplorerCategoryItem(props: ExplorerTargetGroupProps) {
  const classes = useExplorerStyles();

  if (!props.data.nodeId) {
    props.data.nodeId = cuid();
  }

  return (
    <TreeItem className="explorer-group"
      classes={{
        label: classes.label,
        iconContainer: classes.iconContainer,
        selected: classes.selected,
      }}
      nodeId={props.data.nodeId}
      label={props.title}
    >
      {
        props.data.map((explorerTarget) => <ExplorerItem data={explorerTarget} />)
      }
    </TreeItem>
  );
}
