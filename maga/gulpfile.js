const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

// 压缩CSS文件
function minifyCSS() {
  return gulp.src('css/*.css')
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css/minified'));
}

// 压缩JavaScript文件
function minifyJS() {
  return gulp.src('js/*.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js/minified'));
}

// 构建任务
gulp.task('build', gulp.parallel(minifyCSS, minifyJS));

module.exports = {
  minifyCSS,
  minifyJS,
  build: gulp.series('build')
};