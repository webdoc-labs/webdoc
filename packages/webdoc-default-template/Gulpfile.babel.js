import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";
import webpack from "webpack-stream";
import {name} from "./package.json";

gulp.task("build", () => {
  gutil.log(`Building ${name} at ${__dirname}`);

  const entryPath = path.join(__dirname, "./src/app/index.js");
  const configPath = path.join(__dirname, "./webpack.config.js");
  const distPath = path.join(__dirname, "./static/scripts/");

  return gulp.src(entryPath)
    .pipe(webpack(require(path.resolve(__dirname, configPath))))
    .pipe(gulp.dest(distPath));
});
