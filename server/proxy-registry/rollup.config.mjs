import {configureRollup} from "@webdoc/configure-rollup";

export default configureRollup({
  packageDirectory: process.cwd(),
  bundle: true,
  minify: true,
  sourcemaps: false,
});
