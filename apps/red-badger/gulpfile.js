var http = require('http');
var gulp = require('gulp');
var less = require('gulp-less');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var staticServer = require('node-static');

var scripts_build = function() {
	gulp.src('assets/js/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish))
    .pipe(concat('main.js'))
		.pipe(gulp.dest('public/js'));
};

var styles_build = function() {
	return gulp.src('assets/less/main.less')
		.pipe(less())
		.pipe(gulp.dest('public/css'));
};

var start_server = function(next) {
	var port = 3000;
	var server = new staticServer.Server('./');

	http.createServer(function (request, response) {
		request.addListener('end', function () {
			server.serve(request, response);
		}).resume();
	}).listen(port, function() {
		gutil.log('Server listening on port: ' + gutil.colors.magenta(port));
		next();
	});
};

var watch_files = function() {
	gulp.src('assets/**/*.less').pipe(watch(styles_build));
  gulp.src('assets/js/**/*.js').pipe(watch(scripts_build));
};


gulp.task('jshint', scripts_build);
gulp.task('less', styles_build);
gulp.task('watch', watch_files);
gulp.task('server', start_server);
gulp.task('build', [ 'less', 'jshint' ]);
gulp.task('default', [ 'less', 'jshint', 'watch', 'server' ]);