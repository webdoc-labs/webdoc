import {babel} from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import * as fs from "fs/promises";
import json from "@rollup/plugin-json";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import * as path from "path";
import replace from "@rollup/plugin-replace";
import sourcemaps from "rollup-plugin-sourcemaps";
import {terser} from "rollup-plugin-terser";

export async function configureRollup({
  packageDirectory,
  minify = true,
  sourcemaps: _sourcemaps
}) {
  const {dependencies, peerDependencies, version} = JSON.parse(
    await fs.readFile(path.join(packageDirectory, "./package.json")));

  return {
    input: "./src/index.js",
    cache: false,
    output: {
      exports: "auto",
      file: "lib/index.js",
      format: "cjs",
      sourcemap: true,
    },
    external: Object.keys(dependencies || {}).concat(Object.keys(peerDependencies || {})),
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          "process.env.WD_RELEASE": `"${version}"`,
        }
      }),
      babel({babelHelpers: "bundled"}),
      nodeResolve({
        jail: path.join(packageDirectory, "src"),
        rootDir: path.join(packageDirectory, "src"),
      }),
      json({namedExports: true}),
      commonjs({
        include: ["./src/**/*.js"],
      }),
      ...(minify ? [terser()] : []),
      ...(_sourcemaps ? [sourcemaps()] : []),
    ],
  }
}
