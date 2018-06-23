const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const pump = require('pump');
const rename = require('gulp-rename');
const injectCSS = require('gulp-inject-css');
const minifyHTML = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();

gulp.task('default', ['copy-manifest', 'copy-img', 'build', 'watch']);

gulp.task('watch', function() {
  console.log('👀  Gulp is watching 👀 ');
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/scss/**/*.scss', ['styles', 'build-html']);
  gulp.watch('src/*.html', ['build-html']);
  gulp.watch('./dist/**/*').on('change', browserSync.reload);
  browserSync.init({
    server: './dist',
    port: 3000
  });
});

gulp.task('build', ['styles', 'scripts', 'sw', 'build-html']);

gulp.task('styles', function() {
  gulp
    .src([
      'src/scss/styles.scss',
      'src/scss/styles.md.scss',
      'src/scss/styles.lg.scss',
      'src/scss/floatingform.scss'
    ])
    .pipe(
      sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(gulp.dest('./src/css'));
});

gulp.task('build-html', function() {
  gulp
    .src('src/*.html')
    .pipe(injectCSS())
    .pipe(
      minifyHTML({
        removeComments: true,
        collapseWhitespace: true
      })
    )
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-manifest', function() {
  gulp.src('src/manifest.json').pipe(gulp.dest('./dist'));
});

gulp.task('scripts', ['build-main', 'build-restaurants']);

gulp.task('build-main', function() {
  gulp
    .src([
      'src/js/lib/idb.js',
      'src/js/lib/dbhelper.js',
      'src/js/lib/idbhelper.js',
      'src/js/lib/intersection-observer.js',
      'src/js/lib/alerts-handler.js',
      'src/js/main.js'
    ])
    .pipe(babel())
    .pipe(concat('main.js'))
    .pipe(rename('main.js'))
    .pipe(uglify())
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('build-restaurants', function() {
  gulp
    .src([
      'src/js/lib/idb.js',
      'src/js/lib/dbhelper.js',
      'src/js/lib/idbhelper.js',
      'src/js/lib/intersection-observer.js',
      'src/js/lib/alerts-handler.js',
      'src/js/restaurant_info.js'
    ])
    .pipe(babel())
    .pipe(concat('restaurant_info.js'))
    .pipe(rename('restaurant_info.js'))
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy-img', function() {
  gulp
    .src('src/img/*')
    .pipe(
      imagemin({
        progressive: true
      })
    )
    .pipe(webp())
    .pipe(gulp.dest('dist/img'));
  gulp
    .src('src/icons/*')
    .pipe(
      imagemin({
        progressive: true
      })
    )
    .pipe(gulp.dest('dist/icons'));
  gulp.src('src/favicon.ico').pipe(gulp.dest('./dist'));
});

gulp.task('sw', function() {
  gulp
    .src('src/sw.js')
    .pipe(babel())
    .pipe(concat('sw.js'))
    .pipe(gulp.dest('./dist'));
});
