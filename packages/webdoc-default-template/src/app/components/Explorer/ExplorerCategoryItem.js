import ExplorerItem from "./ExplorerItem";
import TreeItem from "@material-ui/lab/TreeItem";
import cuid from "cuid";
import {useExplorerStyles} from "./useExplorerStyles";


export default function ExplorerCategoryItem(props) {
  const classes = useExplorerStyles();

  if (!props.data.nodeId) {
    props.data.nodeId = cuid();
  }

  return (
    <TreeItem
      className="explorer-tree__group"
      classes={{
        label: classes.label,
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
