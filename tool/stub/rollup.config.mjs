import {configureRollup} from "@webdoc/configure-rollup";

export default configureRollup({
  packageDirectory: process.cwd(),
  minify: false,
  sourcemaps: false,
});
