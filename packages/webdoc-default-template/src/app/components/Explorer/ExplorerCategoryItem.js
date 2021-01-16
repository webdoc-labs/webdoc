import ExplorerItem from "./ExplorerItem";
import TreeItem from "@material-ui/lab/TreeItem";
import cuid from "cuid";
import {useExplorerCategoryStyles} from "./useExplorerStyles";

export default function ExplorerCategoryItem(props) {
  const classes = useExplorerCategoryStyles();

  if (!props.data.nodeId) {
    props.data.nodeId = cuid();
  }

  return (
    <TreeItem
      className="explorer-tree__group"
      classes={{
        label: classes.label,
        labelContainer: classes.labelContainer,
        iconContainer: classes.iconContainer,
        selected: classes.selected,
      }}
      nodeId={props.data.nodeId}
      label={props.title}
    >
      {props.data.map(
        (explorerTarget, i) => (<ExplorerItem key={i} data={explorerTarget} />),
      )}
    </TreeItem>
  );
}
