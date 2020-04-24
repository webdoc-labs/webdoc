import * as gulp from "gulp";
import babel from "gulp-babel";
import monorepoTasks from "gulp-tasks-monorepo";
import del from "del";
import * as path from "path";
import * as gutil from "gulp-util";

const monorepo = monorepoTasks({
  dir: path.join(__dirname, "packages"),
});

monorepo.task("build", (pkg) => {
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
