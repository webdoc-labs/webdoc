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
      {<ExplorerHeader
        isOpen={false}
        toggleOpen={() => setExplorerOpen(!explorerOpen)}
      />}
      <div className="header__contents">
        {items.map(([id, appBarItem], i) => (
          appBarItem.kind === "divider" ?
            <section className={`header--divider header--item-${id}`}
              dangerouslySetInnerHTML={{__html: appBarItem.content}}
            /> : (
              <>
                <a
                  className={`header__link${id === currentItemId ? " header__link__current" : ""}`}
                  href={appBarItem.uri}
                  dangerouslySetInnerHTML={{__html: appBarItem.name}}
                />
                {i < items.length - 1 && (
                  <div className="header--gap" />
                )}
              </>
            )
        ))}
        {appData.integrations.search && <Search integration={appData.integrations.search} />}
      </div>
    </div>
  );
});
