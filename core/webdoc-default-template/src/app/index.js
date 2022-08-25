import "./toc";
import Explorer from "./components/Explorer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import {Provider} from "react-redux";
import ReactDOM from "react-dom";
import Settings from "./pages/Settings/Settings";
import {registerServiceWorker} from "../protocol";
import store from "./store";
import {webdocDB} from "../protocol/webdocDB";

window.onload = function() {
  wakeAccordions();

  const appBarRoot = document.getElementById("header-mount-point");
  const explorerRoot = document.getElementById("explorer-mount-point");
  const footerRoot = document.getElementById("footer-mount-point");

  const pageSettingsRoot = document.getElementById("settings-page-mount-point");

  ReactDOM.render(
    (
      <Provider store={store}>
        <Header />
      </Provider>
    ),
    appBarRoot,
  );

  ReactDOM.render(
    (
      <Provider store={store}>
        <Explorer rootRef={{current: explorerRoot}} />
      </Provider>
    ),
    explorerRoot,
  );

  if (footerRoot) {
    ReactDOM.render(
      (
        <Footer/>
      ),
      footerRoot,
    );
  }

  if (pageSettingsRoot) {
    ReactDOM.render(
      (
        <Provider store={store}>
          <Settings />
        </Provider>
      ),
      pageSettingsRoot,
    );
  }

  webdocDB.open().then((db) => {
    console.log(db);
    store.dispatch({
      type: "setDatabase",
      value: db,
    });
  });

  registerServiceWorker()
    .then((service) => service.init())
    .then((service) => {
      store.dispatch({
        type: "setService",
        value: service,
      });
    });
};

function wakeAccordions() {
  document.querySelectorAll(".accordion").forEach(
    (accordion) => {
      const btn = accordion.querySelector(".accordion__toggle");

      btn.onclick = () => {
        accordion.classList.toggle("accordion-active");
      };
    },
  );
}
