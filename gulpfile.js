const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const connect = require('gulp-connect')
const del = require('del')
const fs = require('fs-extra')
const gulp = require('gulp')
const log = require('gulplog')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const tabify = require('gulp-tabify')
const tsify = require('tsify')

gulp.task('connect', (done) => {
	connect.server({
		port: 1337,
		livereload: true,
		root: 'dist',
	})
	done()
})

gulp.task('clean', (done) => {
	del(['dist/**/*'])
	done()
})

gulp.task('shaders', (done) => {
	fs.copy('./src/shaders', './dist/assets/shaders/', (err) => {
		if (err) return console.error(err)
		return console.log('shaders copied!')
	})
	done()
})

gulp.task('images', (done) => {
	fs.copy('./src/images', './dist/assets/images/', (err) => {
		if (err) return console.error(err)
		return console.log('images copied!')
	})
	done()
})

gulp.task('pug', (done) => {
	gulp
		.src('src/*.+(pug|jade)')
		.pipe(pug({ pretty: true }))
		.pipe(tabify(2, false))
		.pipe(gulp.dest('dist'))
		.pipe(connect.reload())
	done()
})

gulp.task('sass', (done) => {
	gulp
		.src('src/styles/index.scss')
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(gulp.dest('dist/assets/styles'))
		.pipe(connect.reload())
	done()
})

gulp.task('build', (done) => {
	browserify({
		basedir: '.',
		debug: true,
		entries: ['./src/scripts/index.ts'],
		cache: {},
		packageCache: {},
	})
		.plugin(tsify)
		.transform('babelify', {
			presets: ['@babel/preset-env'],
			extensions: ['.ts'],
		})
		.bundle()
		.on('error', log.error.bind(log, 'Browserify Error'))
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/assets/scripts'))
		.pipe(connect.reload())
	done()
})

gulp.task('watch', (done) => {
	gulp.watch('src/shaders/*', gulp.series('shaders'))
	gulp.watch('src/images/*', gulp.series('images'))
	gulp.watch('src/**/*+(pug|jade)', gulp.series('pug'))
	gulp.watch('src/**/*.scss', gulp.series('sass'))
	gulp.watch('src/**/*.(ts|js)', gulp.series('build'))
	done()
})

gulp.task(
	'default',
	gulp.series(
		'clean',
		gulp.parallel('build', 'sass', 'pug', 'shaders', 'images'),
		'connect',
		'watch',
	),
)
