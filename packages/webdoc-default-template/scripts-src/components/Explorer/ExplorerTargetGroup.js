import ExplorerTarget from "./ExplorerTarget";

export type ExplorerTargetGroupProps = {
  title: string,
  data: ExplorerTargetData[]
}

export default function ExplorerTargetGroup(props: ExplorerTargetGroupProps) {
  return (
    <section className="explorer-group">
      <ExpandIconG />
      <span className="explorer-group-header">{props.title}</span>
      <section className="explorer-children">
        {
          props.data.map((explorerTarget) => <ExplorerTarget data={explorerTarget} />)
        }
      </section>
    </section>
  );
}

function ExpandIconG() {
  return (
    <img className="explorer-toggle"
      src="https://cdn.jsdelivr.net/npm/octicons@8.5.0/build/svg/triangle-down.svg"
      width="12px"
      height="12px"
    />
  );
}
