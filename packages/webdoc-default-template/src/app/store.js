import {createStore} from "redux";

function globalReducer(state = {}, action) {
  switch (action.type) {
  case "setExplorerOpen":
    return {
      ...state,
      explorerOpen: action.value,
    };
  default:
    return state;
  }
}

export default createStore(globalReducer, {
  explorerOpen: true,
});
