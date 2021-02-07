import {ExplorerHeader} from "../Explorer";
import Search from "./Search";
import {appData} from "../../resource";
import {connect} from "react-redux";
import store from "../../store";

export default connect(({explorerOpen}) => ({
  explorerOpen,
  setExplorerOpen: (isOpen) => store.dispatch({type: "setExplorerOpen", value: isOpen}),
}))(function Header({
  explorerOpen,
  setExplorerOpen,
}) {
  return (
    <div className="header__container">
      {explorerOpen ? null :
        <ExplorerHeader
          isOpen={false}
          toggleOpen={() => setExplorerOpen(!explorerOpen)}
        />}
      <div className="header__contents">
        <a className="header__link header__link__current">API Reference</a>
        {/* <a className="header__link">Guides</a> */ /* TODO: Add guides */}
        {appData.integrations.search && <Search integration={appData.integrations.search} />}
      </div>
    </div>
  );
});
