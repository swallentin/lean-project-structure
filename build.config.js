module.exports = {
	build_dir: 'build',
	compile_dir: 'dist',
	config_dir: './config/',

	app_files: {
		js: ['src/app/**/*.js'],

		atpl: ['build/ng-templates/**/*.tpl.html'],

		jade: 'src/jade/index.jade',

		less: 'src/less/themes/default/master.less'
	},

	test_files: {
		js: [
			'bower_components/angular-mocks/angular-mocks.js'
		]
	},

	vendor_files: {
		js: [
			'bower_components/jquery/jquery.js',
			'bower_components/d3js/d3.v3.js'
			],
		css: [
		],
		assets: [
		]
	},

	ng_template_folder: '/ng-templates'
};