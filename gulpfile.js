var gulp = require('gulp'),
    shell = require('gulp-shell');

gulp.task('init', function () {
    return gulp.src('./scripts/populatedb.js', {read: false})
        .pipe(shell('node <%= file.path %>'))
});