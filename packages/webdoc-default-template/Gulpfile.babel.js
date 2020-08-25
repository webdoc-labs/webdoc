import {
  join as joinPath,
  resolve as resolvePath,
} from "path";
import gulp from "gulp";
import gutil from "gulp-util";
import {name} from "./package.json";
import webpack from "webpack-stream";


gulp.task("build", () => {
  gutil.log(`Building ${name} at ${__dirname}`);

  const entryPath = joinPath(__dirname, "./src/app/index.js");
  const configPath = joinPath(__dirname, "./webpack.config.js");
  const distPath = joinPath(__dirname, "./static/scripts/");

  return gulp.src(entryPath)
    .pipe(
      webpack(
        require(resolvePath(__dirname, configPath)),
      ),
    )
    .pipe(
      gulp.dest(distPath),
    );
});
