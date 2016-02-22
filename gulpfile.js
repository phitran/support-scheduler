const gulp = require('gulp');
const shell = require('gulp-shell');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserify = require('gulp-browserify');
const brfs = require('brfs');
const rename = require('gulp-rename');
const clean = require('gulp-clean');

const isProduction = gulp.env.production;

gulp.task('init', function () {
    return gulp.src('./scripts/populatedb.js', {read: false})
        .pipe(shell('node <%= file.path %>'))
});

gulp.task('clean', function () {
    return gulp.src('./dist', {read: false})
        .pipe(clean());
});

gulp.task('js', ['clean'], function () {
    gulp.src('app/app.js')
        .pipe(browserify({
            transform: ['brfs', 'babelify'],
            debug: isProduction ? false : true
        }))
        .pipe(rename('support-scheduler.js'))
        .pipe(gulp.dest('./dist/js'))
});

gulp.task('css', ['clean'], function () {
    return gulp.src('app/css/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./dist/css'));
});


gulp.watch(['app/**/*.js', 'app/**/*.html', 'app/css/*.scss'], ['default']);

gulp.task('default', ['clean', 'js', 'css']);