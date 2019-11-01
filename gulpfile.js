var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var gulpNgConfig = require('gulp-ng-config');
var config = require('config');
var rename = require('gulp-rename');

gulp.task('sass', function() {
  gulp.src([
    'src/css/fonts.+(scss|css)',
    'src/css/main.+(scss|css)',
    'src/css/**/*.+(scss|css)',
    'src/components/**/*.+(scss|css)',
    'src/pages/**/*.+(scss|css)'
  ])
  .pipe(concat('app.scss'))
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('www/'));
});

gulp.task('config', function() {
  if (config.get('env')) {
    process.env = Object.assign(process.env, config.get('env'));
  }
  var env = process.env.NODE_ENV;
  if (!env) {
    throw new Error("Can't find NODE_ENV");
  }
  return gulp.src('config/' + env + '-client.json')
  .pipe(gulpNgConfig('app.config'))
  .pipe(rename('_config.js'))
  .pipe(gulp.dest('config/'));
});

gulp.task('js', ['config'], function() {
  gulp.src([
    'config/_config.js',
    'src/js/main.js',
    'src/js/vendor/**/*.js',
    'src/services/**/*.js',
    'src/js/**/*.js',
    'src/components/**/*.js',
    'src/pages/**/*.js'
  ])
  .pipe(concat('app.js'))
  .pipe(gulp.dest('www/'));
});

gulp.task('default', function() {
  gulp.start('sass');
  gulp.start('js');
});

gulp.task('all', function() {
	gulp.start('default');
});

gulp.task('watch', function() {
  gulp.start('default');

	watch([
		'src/css/**/*.+(scss|css)',
		'src/components/**/*.+(scss|css)',
		'src/pages/**/*.+(scss|css)'
	], function() {
		gulp.start('sass');
	});

	watch([
		'src/js/**/*.js',
    'src/components/**/*.js',
		'src/services/**/*.js',
		'src/vendor/**/*.js',
		'src/pages/**/*.js'
	], function() {
		gulp.start('js');
	});
});
