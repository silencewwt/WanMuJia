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
    version: '0.0.0',
    serverPath: './src/server/',
    staticPath: './src/static/',
    distPath: './dist/'
};


gulp.task('sass', function () {
    return gulp.src(conf.staticPath + './scss/**/*.scss')
        .pipe($.sass({errLogToConsole: true}))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(conf.serverPath + './static/css'));
});

gulp.task('js', function () {
    return gulp.src(conf.staticPath + './js/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(stylish))
        .pipe(gulp.dest(conf.serverPath + './static/js'));
});

gulp.task('img', function () {
    return gulp.src(conf.staticPath + './img/**/**')
        .pipe(gulp.dest(conf.serverPath + './static/img'));
});

gulp.task('lib', function () {
    gulp.src(
            ['./lib/*.js', './lib/*.css']
            .map(function (src) {
                return conf.staticPath + src;
            })
        )
        .pipe(gulp.dest(conf.serverPath + './static/lib'));

    gulp.src(conf.staticPath + './lib/fonts/**')
        .pipe(gulp.dest(conf.serverPath + './static/lib/fonts'));

    gulp.src(conf.staticPath + './lib/xenon/**')
        .pipe(gulp.dest(conf.serverPath + './static/lib/xenon'));
});

gulp.task('pages', function () {
    return gulp.src('./src/pages/**/**')
        .pipe(gulp.dest(conf.serverPath + './pages'));
});

gulp.task('server', ['sass', 'js', 'img', 'lib', 'pages'], function () {
    $.nodemon({
        script: conf.serverPath + 'server.js',
        ext: 'js html scss',
        ignore: 'gulpfile.js',
        tasks: ['sass', 'js', 'img', 'lib', 'pages']
    })
    .on('restart', function () {
        console.log('restarted!');
    });
});


gulp.task('compress', ['sass', 'js', 'img', 'lib', 'pages'], function () {
    gulp.src(conf.serverPath + './static/css/main.css')
        .pipe($.minifyCss())
        .pipe(gulp.dest(conf.distPath + './static/css'));
    gulp.src(conf.serverPath + './static/lib/*.css')
        .pipe($.minifyCss())
        .pipe(gulp.dest(conf.distPath + './static/lib'));
    gulp.src(conf.serverPath + './static/js/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest(conf.distPath + './static/js'));
    gulp.src(conf.serverPath + './static/lib/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest(conf.distPath + './static/lib'));
    gulp.src(conf.serverPath + './pages/**/*.html')
        .pipe($.minifyHtml())
        .pipe(gulp.dest(conf.distPath + './templates'));
});

gulp.task('release', ['compress'], function () {
    gulp.src(conf.serverPath + './static/lib/fonts/**')
        .pipe(gulp.dest(conf.distPath + './static/lib/fonts'));
});

gulp.task('default', ['server']);
