// TODOs:
// x - ade to html for app
// x - html2js for app
// x - jade to html for demo

/* global process */

module.exports = function (grunt) {

	'use strict';

	var buildConfig,
		taskConfig,
		environment,
		appConstants;

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-recess');

	buildConfig = require('./build.config.js');

	environment = process.env.NODE_ENV || 'dev';

	appConstants = (function () {
		var baseConfig = buildConfig.config_dir + 'config.json',
			envConfig = buildConfig.config_dir + 'config.' + environment + '.json';

		return grunt.util._.extend(grunt.file.readJSON(baseConfig), grunt.file.readJSON(envConfig));
	})();


	taskConfig = {

		/**
		 * We read in our `package.json` file so we can access the package name and
		 * version. It's already there, so we don't repeat ourselves here.
		 */
		pkg: grunt.file.readJSON('package.json'),

		/**
		 * The banner is the comment that is placed at the top of our compiled
		 * source files. It is first processed as a Grunt template, where the `<%=`
		 * pairs are evaluated based on this very configuration object.
		 */
		meta: {
			banner:
				'/**\n' +
				' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				' * <%= pkg.homepage %>\n' +
				' *\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
				' */\n'
		},

		/**
		 * The directories to delete when `grunt clean` is executed.
		 */
		clean: [
			'<%= build_dir %>',
			'<%= compile_dir %>'
		],

		/**
		 * The `copy` task just copies files from A to B. We use it here to copy
		 * our project assets (images, fonts, etc.) and javascripts into
		 * `build_dir`, and then to copy the assets to `compile_dir`.
		 */
		copy: {
			// copies all files from /src/assets into /build/assets
			build_app_assets: {
				files: [
					{
						src: [ '**' ],
						dest: '<%= build_dir %>/assets/',
						cwd: 'src/assets',
						expand: true
					}
				]
			},
			// copies vendor assets defined in build.config.js
			build_vendor_assets: {
				files: [
					{
						src: [ '<%= vendor_files.assets %>'],
						dest: '<%= build_dir/assets/',
						cwd: '.',
						expand: true,
						flatten: true
					}
				]
			},
			// copies all application js files to build folder
			build_appjs: {
				files: [
					{
						src: ['<%= app_files.js %>'],
						dest: '<%= build_dir %>/',
						cwd: '.',
						expand: true
					}
				]
			},
			// copies all vendor js files to build folder
			build_vendorjs: {
				files: [
					{
						src: ['<%= vendor_files.js %>'],
						dest: '<%= build_dir %>/',
						cwd: '.',
						expand: true
					}
				]
			},
			// copies all assets from build dir to comple dir
			compile_assets: {
				files: [
					{
						src: [ '**' ],
						dest: '<%= compile_dir %>/assets',
						cwd: '<%= build_dir %>/assets',
						expand: true
					}
				]
			}
		},

		/**
		 * `grunt concat` concatenates multiple source files into a single file.
		 */
		concat: {
			/**
			 * The `build_css` target concatenates compiled CSS and vendor CSS
			 * together.
			 */
			build_css: {
				src: [
					'<%= vendor_files.css %>',
					'<%= recess.build.dest %>'
				],
				dest: '<%= recess.build.dest %>'
			},
			/**
			 * The `compile_js` target is the concatenation of our application source
			 * code and all specified vendor source code into a single file.
			 */
			compile_js: {
				options: {
					banner: '<%= meta.banner %>'
				},
				src: [
					'<%= vendor_files.js %>',
					'module.prefix',
					'<%= build_dir %>/src/**/*.js',
					'<%= html2js.app.dest %>',
					'module.suffix'
				],
				dest: '<%= compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
			}
		},

		/**
		 * Increments the version number, etc.
		 */
		bump: {
			options: {
				files: [
					"package.json",
					"bower.json"
				],
				commit: true,
				commitMessage: 'chore(release): v%VERSION%',
				commitFiles: [
					"package.json",
					"client/bower.json"
				],
				createTag: true,
				tagName: 'v%VERSION%',
				tagMessage: 'Version %VERSION%',
				push: true,
				pushTo: 'origin'
			}
		},		

		/**
		 * `ng-min` annotates the sources before minifying. That is, it allows us
		 * to code without the array syntax.
		 */
		ngmin: {
			compile: {
				files: [
					{
						src: [ '<%= app_files.js %>' ],
						cwd: '<%= build_dir %>',
						dest: '<%= build_dir %>',
						expand: true
					}
				]
			}
		},

		/**
		 * `connect` is modular web server that allow us to serve static files (helps with testing/development)
		 */

		connect: {
			server: {
				options: {
					port: 9000,
					hostname: '0.0.0.0',
					base: '<%= build_dir %>',
					open: false,
					debug: true
				}
			}
		},

		/**
		 * Builds all jade files into html files. This step is a precursor step to html2js.
		 */

		jade: {
			build: {
				options: {
					pretty: true
				},
				files: [
						// this builds the index.html
					{
						'<%= build_dir %>/src/index.html': buildConfig.app_files.jade
					},
						// this compiles all angular jade templates into a intermediate folder (pre-step to perform html2js)
					{
						expand: true,
						cwd: 'src/app/',
						src: '**/*.tpl.jade',
						dest: '<%= build_dir %><%= ng_template_folder %>',
						ext: '.tpl.html'
					},
						// This compiles all test jade into the build_dir
					{
						expand: true,
						cwd: 'test/jade',
						src: '**/*.jade',
						dest: '<%= build_dir %>/demo',
						ext: '.html'
					}
				]
			}
		},

		/**
		 * HTML2JS is a Grunt plugin that takes all of your template files and
		 * places them into JavaScript files as strings that are added to
		 * AngularJS's template cache. This means that the templates too become
		 * part of the initial payload as one JavaScript file. Neat!
		 */
		html2js: {
			/**
			 * These are the templates from `src/app`.
			 */
			app: {
				options: {
					base: 'build/ng-templates'
				},
				src: [ '<%= app_files.atpl %>' ],
				dest: '<%= build_dir %>/templates-app.js'
			}
		},

		/**
		 * `jshint` defines the rules of our linter as well as which files we
		 * should check. This file, all javascript sources, and all our unit tests
		 * are linted based on the policies listed in `options`. But we can also
		 * specify exclusionary patterns by prefixing them with an exclamation
		 * point (!); this is useful when code comes from a third party but is
		 * nonetheless inside `src/`.
		 */
		jshint: {
			src: [
				'<%= app_files.js %>'
			],
			gruntfile: [
				'Gruntfile.js'
			],
			options: {
				'jshintrc': '.jshintrc'
			}
		},



		/**
		 * `recess` handles our LESS compilation and uglification automatically.
		 * Only our `main.less` file is included in compilation; all other files
		 * must be imported from this file.
		 */
		recess: {
			build: {
				src: [ '<%= app_files.less %>' ],
				dest: '<%= build_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.css',
				options: {
					compile: true,
					compress: false,
					noUnderscores: false,
					noIDs: false,
					zeroUnits: false
				}
			},
			compile: {
				src: [ '<%= recess.build.dest %>' ],
				dest: '<%= recess.build.dest %>',
				options: {
					compile: true,
					compress: true,
					noUnderscores: false,
					noIDs: false,
					zeroUnits: false
				}
			}
		},


		/**
		 * The `index` task compiles the `index.html` file as a Grunt template. CSS
		 * and JS files co-exist here but they get split apart later.
		 */
		index: {

			/**
			 * During development, we don't want to have wait for compilation,
			 * concatenation, minification, etc. So to avoid these steps, we simply
			 * add all script files directly to the `<head>` of `index.html`. The
			 * `src` property contains the list of included files.
			 */
			build: {
				dir: '<%= build_dir %>',
				src: [
					'<%= vendor_files.js %>',
					'<%= build_dir %>/src/**/*.js',
					'<%= html2js.app.dest %>',
					'<%= vendor_files.css %>',
					'<%= recess.build.dest %>'
				]
			},

			/**
			 * When it is time to have a completely compiled application, we can
			 * alter the above to include only a single JavaScript and a single CSS
			 * file. Now we're back!
			 */
			compile: {
				dir: '<%= compile_dir %>',
				src: [
					'<%= concat.compile_js.dest %>',
					'<%= vendor_files.css %>',
					'<%= recess.compile.dest %>'
				]
			}
		},

		/**
		 * And for rapid development, we have a watch set up that checks to see if
		 * any of the files listed below change, and then to execute the listed
		 * tasks when they do. This just saves us from having to type "grunt" into
		 * the command-line every time we want to see what we're working on; we can
		 * instead just leave "grunt watch" running in a background terminal. Set it
		 * and forget it, as Ron Popeil used to tell us.
		 *
		 * But we don't need the same thing to happen for all the files.
		 */
		delta: {
			/**
			 * By default, we want the Live Reload to work for all tasks; this is
			 * overridden in some tasks (like this file) where browser resources are
			 * unaffected. It runs by default on port 35729, which your browser
			 * plugin should auto-detect.
			 */
			options: {
				livereload: true
			},

			/**
			 * When the Gruntfile changes, we just want to lint it. In fact, when
			 * your Gruntfile changes, it will automatically be reloaded!
			 */
			gruntfile: {
				files: 'Gruntfile.js',
				tasks: [ 'jshint:gruntfile' ],
				options: {
					livereload: false
				}
			},

			/**
			 * When our JavaScript source files change, we want to run lint them and
			 * run our unit tests.
			 */
			jssrc: {
				files: [
					'<%= app_files.js %>'
				],
				tasks: [ 'jshint:src', 'copy:build_appjs' ]
			},

			/**
			 * When assets are changed, copy them. Note that this will *not* copy new
			 * files, so this is probably not very useful.
			 */
			assets: {
				files: [
					'src/assets/**/*'
				],
				tasks: [ 'copy:build_assets' ]
			},

			/**
			 * When jade files changes, we need to recompile it.
			 */
			jade: {
				files: [
					'src/jade/**/*.jade',
					'src/app/**/*.jade',
					'test/jade/**/*.jade'
				],
				tasks: [ 'jade:build', 'html2js', 'index:build' ]
			},
			/**
			 * When the CSS files change, we need to compile and minify them.
			 */
			less: {
				files: [ 'src/**/*.less' ],
				tasks: [ 'recess:build' ]
			},

			/**
			 * When the build.config.js change, we need to build from scratch.
			 */
			build_config: {
				files: [ './build.config.js' ],
				tasks: [ 'build' ]
			}

		},

		/**
		 * Minify the sources!
		 */
		uglify: {
			compile: {
				options: {
					banner: '<%= meta.banner %>'
				},
				files: {
					'<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
				}
			}
		},

	};

	grunt.initConfig(grunt.util._.extend(taskConfig, buildConfig));

	/**
	 * The default task is to build and compile.
	 */
	grunt.registerTask('default', [ 'build', 'compile' ]);

	/**
	 * In order to make it safe to just compile or copy *only* what was changed,
	 * we need to ensure we are starting from a clean, fresh build. So we rename
	 * the `watch` task to `delta` (that's why the configuration var above is
	 * `delta`) and then add a new task called `watch` that does a clean build
	 * before watching for changes.
	 */

	grunt.renameTask('watch', 'delta');
	grunt.registerTask('watch', [
		'connect', 'build', 'delta'
	]);

	/**
	 * The `build` task gets your app ready to run for development and testing.
	 */

	grunt.registerTask('build', [
		'clean', 'jshint', 'recess:build', 'jade:build', 'html2js',
		'concat:build_css', 'copy:build_app_assets', 'copy:build_vendor_assets',
		'copy:build_appjs', 'copy:build_vendorjs', 'index:build'
	]);

	/**
	 * The `compile` task gets your app ready for deployment by concatenating and
	 * minifying your code.
	 */
	grunt.registerTask('compile', [
		'recess:compile', 'copy:compile_assets', 'ngmin', 'concat:compile_js', 'uglify', 'index:compile'
	]);


	/**
	 * A utility function to get all app JavaScript sources.
	 */
	function filterForJS(files) {
		return files.filter(function (file) {
			return file.match(/\.js$/);
		});
	}

	/**
	 * A utility function to get all app CSS sources.
	 */
	function filterForCSS(files) {
		return files.filter(function (file) {
			return file.match(/\.css$/);
		});
	}

	/**
	 * The index.html template includes the stylesheet and javascript sources
	 * based on dynamic names calculated in this Gruntfile. This task assembles
	 * the list into variables for the template to use and then runs the
	 * compilation.
	 */
	grunt.registerMultiTask('index', 'Process index.html template', function () {
		var dirRE, jsFiles, cssFiles;

		dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g');

		jsFiles = filterForJS(this.filesSrc).map(function (file) {
			return file.replace(dirRE, '');
		});

		cssFiles = filterForCSS(this.filesSrc).map(function (file) {
			return file.replace(dirRE, '');
		});

		grunt.file.copy(grunt.config('build_dir') + '/src/index.html', this.data.dir + '/index.html', {
			process: function (contents, path) {
				return grunt.template.process(contents, {
					data: {
						scripts: jsFiles,
						styles: cssFiles,
						version: grunt.config('pkg.version')
					}
				});
			}
		});
	});

};