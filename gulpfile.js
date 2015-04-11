var gulp = require('gulp');
var stylish = require('jshint-stylish');
var $ = require('gulp-load-plugins')({
    rename: {
        'gulp-minify-css': 'minifyCss',
        'gulp-minify-html': 'minifyHtml'
    }
});

var conf = {
    pojName: 'myj',
    version: '0.0.0'
};


gulp.task('sass', function () {
    return gulp.src('./src/static/scss/*.scss')
        .pipe($.sass({errLogToConsole: true}))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('./src/static/css'));
});

gulp.task('lint', function () {
    return gulp.src('./src/static/js/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(stylish));
});

gulp.task('nunjs', function () {
    return gulp.src('./src/pages/*.html')
        .pipe($.rename({extname: '.nunjs'}))
        .pipe(gulp.dest('./src/pages/nunjs'));
});

gulp.task('server', ['sass', 'lint', 'nunjs'], function () {
    $.nodemon({
        script: './src/server.js',
        ext: 'js html scss',
        ignore: 'gulpfile.js',
        env: { 'NODE_ENV': 'development' },
        tasks: ['sass', 'lint', 'nunjs']
    })
    .on('restart', function () {
        console.log('restarted!');
    });
});


gulp.task('compress', ['sass', 'lint'], function () {
    gulp.src('./src/static/css/*.css')
        .pipe($.minifyCss())
        .pipe(gulp.dest('./dist/static/css'));
    gulp.src('./src/static/lib/*.css')
        .pipe($.minifyCss())
        .pipe(gulp.dest('./dist/static/lib'));
    gulp.src('./src/static/js/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest('./dist/static/js'));
    gulp.src('./src/static/lib/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest('./dist/static/lib'));
    gulp.src('./src/pages/*.html')
        .pipe($.minifyHtml())
        .pipe(gulp.dest('./dist/templates'));
});

gulp.task('release', ['compress'], function () {
    gulp.src('./static/fonts/*')
        .pipe(gulp.dest('./dist/static/fonts'));
});

gulp.task('default', ['server']);
