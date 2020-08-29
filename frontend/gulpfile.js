const { errorMonitor } = require('stream');

/**
 * Dependencies
 */
const
	gulp = require('gulp'),
	gulpIf = require('gulp-if'),
	sass = require('gulp-sass'),
	babel = require('gulp-babel'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	concat = require('gulp-concat'),
	plumber = require('gulp-plumber'),
	cleanCSS = require('gulp-clean-css'),
	replace = require('gulp-replace'),
	imagemin = require('gulp-imagemin'),
	sourcemaps = require('gulp-sourcemaps'),
	fileinclude = require('gulp-file-include'),
	autoprefixer = require('gulp-autoprefixer'),
	webpack = require('webpack'),
	webpackStream = require('webpack-stream'),
	dotenv = require('dotenv-webpack'),
	del = require('del'),
	minimist = require('minimist'),
	browserSync = require('browser-sync').create(),
	path = require('path');

/**
 * Get node options
 * @type {*|(function(): argv)}
 */
const
    node_dependencies = Object.keys(require('./package.json').dependencies || {}),
    is_local = process.argv.slice(2)[0] !== 'build',
    node_options = minimist(process.argv.slice(2), { string: 'env', default: { env: process.env.NODE_ENV || 'development' } })

    switch(node_options.env){
    	case 'development':
				node_env_file = '.env.development';
				break;

			case 'acceptance':
				node_env_file = '.env.acceptance';
				break;

			default:
				node_env_file = '.env';
				break;
    }

/**
 * Get environment options
 */
require('dotenv').config({
	path: node_env_file
});



/**
 * Set folder structure
 * @type {string}
 */
const
	src_folder = './app/',
	public_folder = src_folder + 'assets/',
	dist_folder_production = 'dist/',
	dist_folder_development = '.tmp/',
	dist_folder = is_local ? dist_folder_development : dist_folder_production,
	dist_public_folder = dist_folder + 'assets/',
	node_modules_folder = './node_modules/',
	hash = node_options.env !== 'development' && parseInt(process.env.BUILD_HASH) ? `${new Date().getTime()}.` : '',
	webpack_config = is_local ? {
		stats: 'errors-only',
		mode: node_options.env !== 'development' ? 'production' : 'development',
		plugins: [
			new dotenv({path: node_env_file}),
			new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery'})
		],
		resolve: {
			alias: {
				'~': path.resolve(__dirname, 'app'),
				'scripts': path.resolve(__dirname, 'app', 'assets', 'scripts'),
				'LWCore': path.resolve(__dirname, 'app', 'assets', 'scripts', '_LWCore'),
				'components': path.resolve(__dirname, 'app', 'assets', 'scripts', 'components'),
				'sections': path.resolve(__dirname, 'app', 'assets', 'scripts', 'sections'),
				'pages': path.resolve(__dirname, 'app', 'assets', 'scripts', 'pages')
			}
		},
		module: {
			rules: [
				{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: [
								"@babel/plugin-transform-async-to-generator",
								'@babel/plugin-proposal-object-rest-spread',
								'@babel/plugin-transform-runtime'
							]
						}
					}
				}
			]
		}
	} : {
		stats: 'errors-only',
		mode: node_options.env !== 'development' ? 'production' : 'development',
		plugins: [
			new dotenv({path: node_env_file}),
			new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery'})
		],
		resolve: {
			alias: {
				'~': path.resolve(__dirname, 'app'),
				'scripts': path.resolve(__dirname, 'app', 'assets', 'scripts'),
				'LWCore': path.resolve(__dirname, 'app', 'assets', 'scripts', '_LWCore'),
				'components': path.resolve(__dirname, 'app', 'assets', 'scripts', 'components'),
				'sections': path.resolve(__dirname, 'app', 'assets', 'scripts', 'sections'),
				'pages': path.resolve(__dirname, 'app', 'assets', 'scripts', 'pages')
			}
		},
		module: {
			rules: [
				{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'@babel/preset-env',
									{
										useBuiltIns: 'usage',
										corejs: 3
									}
								]
							],
							plugins: [
								"@babel/plugin-transform-async-to-generator",
								'@babel/plugin-proposal-object-rest-spread',
								'@babel/plugin-transform-runtime'
							]
						}
					}
				}
			]
		}
	};


/**
 * Print build and app settings to console
 */
console.log(`
  BUILD SETTINGS
> source mapping               ${is_local ? 'on' : 'off'}
> serving from                 ${dist_folder}
> env file                     ${node_env_file}

  APP SETTINGS
> app.settings.hostType        ${is_local ? 'local' : 'remote'}
> app.settings.environment     ${process.env.ENVIRONMENT}
> app.settings.publicUrl       ${process.env.HOST_PUBLIC}
> app.settings.apiUrl          ${process.env.HOST_API}
> app.settings.scaleUrl        ${process.env.IMAGE_SCALE_URL}
> app.settings.imageScale      ${process.env.IMAGE_SCALE}
> app.settings.imageGroup      ${process.env.IMAGE_SCALE_GROUP}
`);


/**
 * Remove .tmp and dist folder after build
 */
gulp.task('clear', () => del([
	dist_folder_development,
	dist_folder_production
]));

/**
 * Get changed html, fill variables and copy to dist folder.
 */
gulp.task('html', () => {
    return gulp.src([src_folder + '**/*.html'], { base: src_folder })
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(replace('@PAGE_TITLE', process.env.PAGE_TITLE))
        .pipe(replace('@PAGE_DESCRIPTION', process.env.PAGE_DESCRIPTION))
        .pipe(replace('@PAGE_LANGUAGE', process.env.PAGE_LANGUAGE))
        .pipe(replace('@PAGE_GAID', process.env.PAGE_GAID))
        .pipe(replace('@PAGE_GTMID', process.env.PAGE_GTMID))
        .pipe(replace('@OG_TITLE', process.env.OG_TITLE))
        .pipe(replace('@OG_IMAGE', process.env.OG_IMAGE))
        .pipe(replace('@OG_DESCRIPTION', process.env.OG_DESCRIPTION))
		.pipe(replace('/main.js', `/${hash}main.js`))
		.pipe(replace('/main.css', `/${hash}main.css`))
        .pipe(gulp.dest(dist_folder))
        .pipe(browserSync.stream());
});


/**
 * Get favicon and copy to dist folder.
 */
gulp.task('favicon', () => {
    return gulp.src([src_folder + '*.ico'])
        .pipe(gulp.dest(dist_folder))
        .pipe(browserSync.stream());
});


/**
 * Get changed html, fill variables and copy to dist folder.
 */
gulp.task('fonts', () => {
	return gulp.src([public_folder + 'fonts/**/*.{ttf,woff,woff2,eof,otf,svg}'])
		.pipe(gulp.dest(dist_public_folder + 'fonts'))
		.pipe(browserSync.stream());
});


/**
 * Get changed html, fill variables and copy to dist folder.
 */
gulp.task('data', () => {
	return gulp.src([public_folder + 'data/**/*'])
		.pipe(gulp.dest(dist_public_folder + 'data'))
		.pipe(browserSync.stream());
});


/**
 * Get app scss files, build
 */
gulp.task('sass', () => {
	return gulp.src([public_folder + 'styles/main.scss'])
		.pipe(gulpIf(node_options.env == 'development', plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "SASS error in " + err.plugin,
					message: err.formatted
				})(err);
				this.emit('end');
			}
		})))
		.pipe(gulpIf(node_options.env == 'development', sourcemaps.init()))
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(cleanCSS())
		.pipe(gulpIf(node_options.env == 'development', sourcemaps.write('.')))
		.pipe(concat(`${hash}main.css`))
		.pipe(gulp.dest(dist_public_folder + 'styles'))
		.pipe(browserSync.stream());
});

/**
 * Build JavaScript
 */
gulp.task('js', () => {
	return gulp
		.src([public_folder + 'scripts/main.js'])
		.pipe(gulpIf(node_options.env == 'development', plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "JS error in " + err.plugin,
					message: err.formatted
				})(err);
				this.emit('end');
			}
		})))
		.pipe(gulpIf(node_options.env == 'development', sourcemaps.init()))
		.pipe(webpackStream(webpack_config))
		.pipe(concat(`${hash}main.js`))
		.pipe(gulpIf(node_options.env !== 'development', uglify()))
		.pipe(gulpIf(node_options.env == 'development', sourcemaps.write('.')))
		.pipe(gulp.dest(dist_public_folder + 'scripts'))
		.pipe(browserSync.stream());
});

/**
 * Copy and minify images
 */
gulp.task('images', () => {
	return gulp.src([public_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'])
		.pipe(plumber())
		.pipe(gulpIf(node_options.env !== 'development',imagemin()))
		.pipe(gulp.dest(dist_public_folder + 'images'))
		.pipe(browserSync.stream());
});

/**
 * Copy and minify videos
 */
gulp.task('videos', () => {
	return gulp.src([public_folder + 'videos/**/*.+(mp4|webm)'])
		.pipe(plumber())
		.pipe(imagemin())
		.pipe(gulp.dest(dist_public_folder + 'videos'))
		.pipe(browserSync.stream());
});

/**
 * Chain all build tasks
 */
gulp.task('build', gulp.series('clear', 'html', 'sass', 'js', 'fonts', 'data', 'images', 'videos'));

/**
 * Chain all dev tasks
 */
gulp.task('dev', gulp.series('html', 'sass', 'js'));

/**
 *
 */
gulp.task('serve', () => {
	return browserSync.init({
		server: {
			baseDir: [dist_folder],
			port: 3000
		},
		open: true
	});
});


/**
 * Watch /app folder for changes and
 */
gulp.task('watch', () => {
	const watchImages = [
		public_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'
	];

	const watchVideos = [
		public_folder + 'videos/**/*.+(mp4|webm)'
	];

	const watchVendor = [];

	node_dependencies.forEach(dependency => {
		watchVendor.push(node_modules_folder + dependency + '/**/*.*');
	});

	gulp.watch(src_folder + '**/*.html', gulp.series('html'));
	gulp.watch(public_folder + 'data/**/*', gulp.series('data'));
	gulp.watch(public_folder + 'fonts/**/*.{ttf,woff,woff2,otf,eof,svg}', gulp.series('fonts'));
	gulp.watch(public_folder + 'styles/**/*.scss', gulp.series('sass'));
	gulp.watch(public_folder + 'scripts/**/*.js', gulp.series('js'));
	gulp.watch(watchImages, gulp.series('images'));
	gulp.watch(watchVideos, gulp.series('videos'));
	gulp.watch(watchVendor).on('change', browserSync.reload);
});


/**
 * Default task
 */
gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));
