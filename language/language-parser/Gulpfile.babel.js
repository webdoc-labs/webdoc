import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";
import {dependencies, name} from "./package.json";
import babel from "gulp-babel";
import commonjs from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import {rollup} from "rollup";
import del from "del";
import * as stream from "stream";

gulp.task("build", () => {
  const libPath = path.join(__dirname, "/lib");

  try {
    del.sync(libPath);
  } catch (e) {
    // continue regardless of error.
  }

  gutil.log(`Building ${name} at ${libPath}`);
  return gulp.src(path.join(__dirname, "/src/**/*.js"))
    .pipe(babel())
    .pipe(function() {
      const readable = new class extends stream.Readable {
        _read(size) {}
      }();

      rollup({
        input: "./src/index.js",
        cache: false,
        output: {
          exports: "default",
          file: "index.js",
          format: "cjs",
        },
        external: Object.keys(dependencies),
        plugins: [
          nodeResolve({
            jail: path.join(__dirname, "src"),
            rootDir: path.join(__dirname, "src"),
          }),
          commonjs({
            include: ["./src/**/*.js"],
          }),
        ],
      })
        .then((bundle) => bundle.generate())
        .then((output) => {
          console.log(output);
          readable.push(output[0].code);
          readable.push(null);
        })
        .catch((error) => {
          setImmediate(() => readable.emit("error", error));
        });

      return readable;
    }())
    .pipe(gulp.dest(libPath));
});
