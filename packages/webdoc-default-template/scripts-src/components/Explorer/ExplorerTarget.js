import * as React from "react";
import type {ExplorerTargetData} from "./ExplorerTargetData";
import ExplorerTargetGroup from "./ExplorerTargetGroup";

type ExplorerTargetProps = {
  currentTarget: string,
  data: ExplorerTargetData,
}

export default function ExplorerTarget(props: ExplorerTargetProps) {
  const [expanded, setExpanded] = React.useState(true);

  const keys = props.data.children ? Object.keys(props.data.children) : [];
  const hasChildren = keys.length > 0;

  const targetChildren = [];

  for (const [key, value] of Object.entries(props.data.children || {})) {
    if (Array.isArray(value)) {
      targetChildren.push(<ExplorerTargetGroup title={key} data={value} />);
    } else {
      targetChildren.push(<ExplorerTarget data={value} />);
    }
  }

  return (
    <div className="explorer-target">
      {
        hasChildren ?
          <ExpandIcon /> :
          []
      }
      <a className="explorer-link" href={props.data.page}>{props.data.title || "NoTile"}</a>
      <section className="explorer-children" style={{visible: expanded}}>
        {targetChildren}
      </section>
    </div>
  );
}

function ExpandIcon() {
  return (
    <img className="explorer-toggle"
      src="https://cdn.jsdelivr.net/npm/octicons@8.5.0/build/svg/triangle-down.svg"
      width="12px"
      height="12px"
    />
  );
}
