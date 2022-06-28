import {makeStyles} from "@material-ui/core/styles";

const itemStyle = {
  label: {
    alignItems: "center !important",
    display: "flex !important",
    color: "#222 !important",
    fontSize: ".875em !important",
    lineHeight: "2.5em !important",
    paddingLeft: "0",
  },
  labelLinks: {
    color: "#222 !important",
  },
  iconContainer: {
    color: "#222",
    fontSize: 8,
    marginRight: 0,
  },
  selected: {
    backgroundColor: "none",
  },
  root: {
    padding: "0 8px",
  },
};

export const useExplorerStyles = makeStyles(itemStyle);

export const useExplorerCategoryStyles = makeStyles(itemStyle);

export const useExplorerPrimaryItemStyles = makeStyles({
  labelLinks: {
    ...itemStyle.labelLinks,
    color: "#0066CD !important",
  },
});
