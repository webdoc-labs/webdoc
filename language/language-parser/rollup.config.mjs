import * as path from "path";
import {configureRollup} from "@webdoc/configure-rollup";
import {fileURLToPath} from "url";

export default await Promise.all([
  configureRollup({
    packageDirectory: path.dirname(fileURLToPath(import.meta.url)),
    minify: false,
  }),
  configureRollup({
    packageDirectory: path.dirname(fileURLToPath(import.meta.url)),
    minify: false,
  }).then((config) => ({
    ...config,
    input: "./src/indexer/worker.js",
    output: {
      exports: "auto",
      file: "lib/worker.js",
      format: "cjs",
      sourcemap: true,
    },
  })),
]);
