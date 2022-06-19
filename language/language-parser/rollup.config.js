import {babel} from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import {dependencies} from "./package.json";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import path from "path";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";

export default {
  input: "./src/index.js",
  cache: false,
  output: {
    exports: "auto",
    file: "lib/index.js",
    format: "cjs",
    sourcemap: true,
  },
  external: Object.keys(dependencies),
  plugins: [
    sourcemaps(),
    babel({babelHelpers: "bundled"}),
    nodeResolve({
      jail: path.join(__dirname, "src"),
      rootDir: path.join(__dirname, "src"),
    }),
    commonjs({
      include: ["./src/**/*.js"],
    }),
    terser(),
  ],
};
