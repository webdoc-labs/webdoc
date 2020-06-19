import * as gulp from "gulp";
import * as gutil from "gulp-util";
import * as path from "path";
import babel from "gulp-babel";
import del from "del";
import monorepoTasks from "gulp-tasks-monorepo";
import webpack from "webpack-stream";

const monorepo = monorepoTasks({
  dir: path.join(__dirname, "packages"),
});

monorepo.task("build", (pkg) => {
  if (pkg.name() === "webdoc-default-template") {
    // NOTE: @webdoc/default-template has a special build process
    return buildDefaultTemplate(pkg);
  }

  const pkgLocation = pkg.location();
  const pkgLib = path.join(pkgLocation, "/lib");

  gutil.log(`Building ${pkg.name()} at ${pkgLocation}`);

  try {
    del.sync(pkgLib);
  } catch (e) {

  }

  return gulp.src(path.join(pkg.location(), "/src/**/*.js"))
    .pipe(babel())
    .pipe(gulp.dest(pkgLib));
});

function buildDefaultTemplate(pkg) {
  const entryPath = path.join(pkg.location(), "./scripts-src/index.js");
  const configPath = path.join(pkg.location(), "./webpack.config.js");
  const distPath = path.join(pkg.location(), "./static/scripts/");

  const cwd = process.cwd();

  process.chdir(pkg.location());

  const result = gulp.src(entryPath)
    .pipe(webpack(require(path.resolve(__dirname, configPath))))
    .pipe(gulp.dest(distPath));

  process.chdir(cwd);

  return result;
}
