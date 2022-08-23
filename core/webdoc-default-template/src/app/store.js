import {createStore} from "redux";

function globalReducer(state = {}, action) {
  switch (action.type) {
  case "setExplorerOpen":
    return {
      ...state,
      explorerOpen: action.value,
    };
  case "setQuery":
    if (!state.query && action.value) {
      state.expandedItemsBeforeQuery = state.expandedItems;
    } else if (state.query && !action.value) {
      state.expandedItems = state.expandedItemsBeforeQuery;
    }

    if (action.value) {
      return {
        ...state,
        query: action.value,
        expandedItems: action.items,
      };
    } else {
      return {
        ...state,
        query: action.value,
      };
    }
  case "setExpandedItems":
    return {
      ...state,
      expandedItems: new Set(action.value),
    };
  case "toggleItem": {
    const expandedItems = new Set(state.expandedItems);

    if (action.value !== undefined) {
      expandedItems[action.value ? "add" : "delete"](action.nodeId);
    } else {
      expandedItems[expandedItems.has(action.nodeId) ? "delete" : "add"](action.nodeId);
    }

    return {
      ...state,
      expandedItems,
    };
  }
  case "setDatabase": {
    return {
      ...state,
      database: action.value,
    };
  }
  case "setService": {
    return {
      ...state,
      service: action.value,
    };
  }
  default:
    return state;
  }
}

export default createStore(globalReducer, {
  expandedItems: new Set(),
  explorerOpen: true,
  expandedItemsBeforeQuery: new Set(),
  query: "",
  database: null,
  service: null,
});
