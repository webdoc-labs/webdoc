import React from "react";
import {connect} from "react-redux";
import debounce from "lodash/debounce";
import store from "../../store";

function filterTree(query, collector, data) {
  data.$match = !query || (!!data.title && data.title.toLowerCase().includes(query));

  if (data.children) {
    for (const [key, value] of Object.entries(data.children)) {
      if (key.charAt(0) === "$") {
        continue;
      }
      filterTree(query, collector, value);
      data.$match = data.$match || value.$match;
    }
  }

  if (query && data.$match) {
    collector.add(data.$nodeId);
  }
}

export default connect(() => ({
  nextQuery: (query, items) => store.dispatch({
    type: "setQuery",
    value: query,
    items,
  }),
}))(function ExplorerFilter(props) {
  const onNativeChange = React.useCallback(
    debounce((e) => {
      const query = e.target.value;
      const items = new Set();

      const startish = Date.now();
      filterTree(query.toLowerCase(), items, props.data);
      console.log("Search took: " + Date.now() - startish + " ms");
      props.nextQuery(query, items);
    }, 200, {
      maxWait: 1000,
    }),
    [props.data],
  );

  const onChange = React.useCallback(
    (e) => onNativeChange(e.nativeEvent),
    [onNativeChange],
  );

  return (
    <input
      onChange={onChange}
      placeholder="Filter"
      type="text"
    />
  );
});
