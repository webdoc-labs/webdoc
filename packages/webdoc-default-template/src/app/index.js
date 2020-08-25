import Explorer from "./components/Explorer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ReactDOM from "react-dom";

window.onload = function() {
  const appBarRoot = document.getElementById("header-mount-point");
  const explorerRoot = document.getElementById("explorer-mount-point");
  const footerRoot = document.getElementById("footer-mount-point");

  ReactDOM.render(
    (
      <Header />
    ),
    appBarRoot,
  );

  ReactDOM.render(
    (
      <Explorer />
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
