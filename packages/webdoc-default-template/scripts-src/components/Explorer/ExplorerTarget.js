import * as React from "react";
import type {ExplorerTargetData} from "./ExplorerTargetData";

type ExplorerTargetProps = {
  currentTarget: string,
  data: ExplorerTargetData,
}

export default function ExplorerTarget(props: ExplorerTargetProps) {
  const [expanded, setExpanded] = React.useState(props.data.expandByDefault);

  return (
    <div class="explorer-target">
      <a class="explorer-link" href={props.data.targetLink}>{props.data.targetName}</a>
      <section class="explorer-children" style={{visible: expanded}}>
        {props.data.children ?
          props.data.children.map((child) => <ExplorerTarget data={child}/>) :
          []}
      </section>
      {
        props.data.children && props.data.children.length ?
          <img class="explorer-toggle"
            src="https://cdn.jsdelivr.net/npm/octicons@8.5.0/build/svg/triangle-down.svg"
          /> :
          []
      }
    </div>
  );
}
