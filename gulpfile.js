const gulp = require('gulp');
const shell = require('gulp-shell');
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
            transform: ['brfs'],
            debug: isProduction ? false : true
        }))
        .pipe(rename('support-scheduler.js'))
        .pipe(gulp.dest('./dist/js'))
});

gulp.task( 'default', [ 'clean', 'js' ] );