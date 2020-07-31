import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";
import babel from "gulp-babel";
import del from "del";

import {name} from "./package.json";

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
    .pipe(gulp.dest(libPath));
});
