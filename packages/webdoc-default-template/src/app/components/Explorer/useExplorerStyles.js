import {makeStyles} from "@material-ui/core/styles";

const itemStyle = {
  label: {
    alignItems: "center",
    display: "flex",
    color: "#333333",
    fontSize: 12,
    height: "24px",
    lineHeight: "14px",
  },
  labelLinks: {
    color: "#333333",
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
    fontWeight: "bold",
  },
});
