import * as gulp from 'gulp';
import babel from 'gulp-babel';
import monorepoTasks from 'gulp-tasks-monorepo';
import * as path from 'path';
import * as gutil from 'gulp-util';

const monorepo = monorepoTasks({
  dir: path.join(__dirname, 'packages'),
});

monorepo.task('build', (pkg) => {
  gutil.log(`Building ${pkg.name()} at ${pkg.location()}`);

  return gulp.src(path.join(pkg.location(), '/src/*.js'))
      .pipe(babel())
      .pipe(gulp.dest(path.join(pkg.location(), '/lib')));
});
