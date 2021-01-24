import {makeStyles} from "@material-ui/core/styles";

const itemStyle = {
  label: {
    alignItems: "center !important",
    display: "flex !important",
    color: "#333333 !important",
    fontSize: "12px !important",
    height: "24px !important",
    lineHeight: "14px !important",
  },
  labelLinks: {
    color: "#333333 !important",
  },
  iconContainer: {
    color: "#333333",
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

export const useExplorerCategoryStyles = makeStyles({
  ...itemStyle,
  label: {
    ...itemStyle.label,
    fontWeight: "bold !important",
  },
});

export const useExplorerPrimaryItemStyles = makeStyles({
  labelLinks: {
    ...itemStyle.labelLinks,
    color: "#0066CD !important",
  },
});
