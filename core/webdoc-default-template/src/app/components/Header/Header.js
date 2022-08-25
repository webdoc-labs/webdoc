import {ExplorerHeader} from "../Explorer";
import Search from "./Search";
import {connect} from "react-redux";
import store from "../../store";

export default connect(({explorerOpen}) => ({
  explorerOpen,
  setExplorerOpen: (isOpen) => store.dispatch({type: "setExplorerOpen", value: isOpen}),
}))(function Header({
  explorerOpen,
  setExplorerOpen,
}) {
  const items = Object.entries(window.appData.appBar.items);
  const currentItemId = window.appData.appBar.current;

  return (
    <div className="header__container">
      {<ExplorerHeader
        isOpen={false}
        toggleOpen={() => setExplorerOpen(!explorerOpen)}
      />}
      <div className="header__contents">
        {items.map(([id, appBarItem], i) => (
          appBarItem.kind === "divider" ?
            <section key={id} className={`header__divider header__item-${id}`}
              dangerouslySetInnerHTML={{__html: appBarItem.content}}
            /> : (
              <React.Fragment key={id}>
                <a
                  className={`header__link${id === currentItemId ? " header__link--current" : ""}`}
                  href={appBarItem.uri}
                  dangerouslySetInnerHTML={{__html: appBarItem.name}}
                />
                {i < items.length - 1 && (
                  <div className="header__gap" />
                )}
              </React.Fragment>
            )
        ))}
        {window.appData.integrations.search &&
          <Search integration={window.appData.integrations.search} />}
      </div>
    </div>
  );
});
