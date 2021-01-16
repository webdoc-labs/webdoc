import Explorer from "./components/Explorer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import {Provider} from "react-redux";
import ReactDOM from "react-dom";
import store from "./store";

window.onload = function() {
  const appBarRoot = document.getElementById("header-mount-point");
  const explorerRoot = document.getElementById("explorer-mount-point");
  const footerRoot = document.getElementById("footer-mount-point");

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
        <Explorer />
      </Provider>
    ),
    explorerRoot,
  );

  ReactDOM.render(
    (
      <Footer />
    ),
    footerRoot,
  );
};
