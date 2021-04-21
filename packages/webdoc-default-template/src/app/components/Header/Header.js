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
  const items = Object.entries(appData.appBar.items);
  const currentItemId = appData.appBar.current;

  return (
    <div className="header__container">
      {explorerOpen ? null :
        <ExplorerHeader
          isOpen={false}
          toggleOpen={() => setExplorerOpen(!explorerOpen)}
        />}
      <div className="header__contents">
        {items.map(([id, appBarItem], i) => (
          <a
            className={`header__link${id === currentItemId ? " header__link__current" : ""}`}
            href={appBarItem.uri}
          >
            {appBarItem.name}
          </a>
        ))}
        {appData.integrations.search && <Search integration={appData.integrations.search} />}
      </div>
    </div>
  );
});
