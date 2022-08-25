import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import {makeStyles} from "@material-ui/core/styles";

const useToggleButtonStyles = makeStyles({
  root: {
    color: "var(--color-primary-text)",
    margin: "0 0 0 12px",
  },
});

export default function ExplorerHeader({
  isOpen,
  toggleOpen,
}) {
  const {root} = useToggleButtonStyles();

  return (
    <section className={"explorer__header" + (
      isOpen ? " explorer__header-opened" : " explorer__header-closed"
    )}>
      <IconButton
        aria-label="Toggle Explorer"
        classes={{
          root,
        }}
        onClick={toggleOpen}
      >
        <MenuIcon />
      </IconButton>
      <span
        className="explorer__header__title"
        dangerouslySetInnerHTML={{
          __html: window.appData.applicationName,
        }}
      />
    </section>
  );
}
