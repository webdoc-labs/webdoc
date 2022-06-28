import * as path from "path";
import {configureRollup} from "@webdoc/configure-rollup";
import {fileURLToPath} from "url";

export default await configureRollup({
  packageDirectory: path.dirname(fileURLToPath(import.meta.url)),
  minify: false,
});
