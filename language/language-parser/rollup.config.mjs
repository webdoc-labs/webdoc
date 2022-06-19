import {configureRollup} from "@webdoc/configure-rollup";
import {fileURLToPath} from "url";
import * as path from "path";

export default await configureRollup({
  packageDirectory: path.dirname(fileURLToPath(import.meta.url)),
  minify: true,
  sourcemaps: true,
});
