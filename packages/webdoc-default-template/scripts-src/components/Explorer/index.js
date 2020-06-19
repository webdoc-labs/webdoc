// @flow

import * as React from "react";
import ExplorerTarget from "./ExplorerTarget";
import type {ExplorerTargetData} from "./ExplorerTargetData";

export type ExplorerProps = {
  data: ExplorerTargetData[];
};

export default function Explorer(props: ExplorerProps) {
  return (
    <nav class="explorer">
      {props.data.map((ent) => <ExplorerTarget data={ent} />)}
    </nav>
  );
}
