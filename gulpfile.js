var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

var conf = {
    pojName: 'myj_admin',
    version: '0.0.0',
    staticPath: './src/static/',
    distPath: './dist/'
};

gulp.task('server', function () {
    nodemon({
        script: './server.js',
        ext: '*',
        ignore: 'gulpfile.js'
    })
    .on('restart', function () {
        console.log('restarted!');
    });
});

gulp.task('default', ['server']);