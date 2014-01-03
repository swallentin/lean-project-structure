(function () {
	'use strict';

	angular.module('admincms', [
			'admincms.constant',
			'admincms.security',
			'ui.bootstrap',
			'templates-app',
			'templates-common',
			'admincms.common',
			'admincms.schedule',
			'admincms.broadcast',
			'admincms.channel',
			'ui.router'
		])
		.config(function ($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider, settings) {

			$httpProvider.defaults.withCredentials = true;

			$urlRouterProvider
				.otherwise(settings.defaultRoute);

			$stateProvider

				// Base layout
				.state('loggedin', {
					abstract: true,
					templateUrl: 'common/templates/base.tpl.html'
				})

				// Setting up two_column_with_top layout, channel and broadcast states uses this layout
				.state('loggedin.two_column_with_top', {
					templateUrl: 'common/templates/two_column_with_top.tpl.html'
				})


				// Schedule states
				.state('loggedin.two_column_with_top.schedule', {
					url: '/schedule',
					views: {
						"top": {
							controller: 'ScheduleTopCtrl',
							templateUrl: 'schedule/templates/scheduleTop.tpl.html'
						},
						"left": {
							controller: 'ScheduleCtrl',
							templateUrl: 'schedule/templates/channels.tpl.html'
						}
					}
				})
				.state('loggedin.two_column_with_top.schedule.edit', {
					url: '/edit/:id',
					views: {
						"right@loggedin.two_column_with_top": {
							templateUrl: 'broadcast/templates/editBroadcast.tpl.html',
							controller: 'EditBroadcastCtrl'
						}
					}
				})

				// Channel states
				.state('loggedin.two_column_with_top.channel', {
					url: '/channel',
					views: {
						"top": {
							controller: 'ChannelTopCtrl',
							templateUrl: 'channel/templates/channelTop.tpl.html'
						},
						"left": {
							controller: 'ChannelsCtrl',
							templateUrl: 'channel/templates/channels.tpl.html'
						}
					}
				})
				.state('loggedin.two_column_with_top.channel.edit', {
					url: '/edit/:id',
					views: {
						"right@loggedin.two_column_with_top": {
							controller: 'EditChannelCtrl',
							templateUrl: 'channel/templates/editChannel.tpl.html'
						}
					}
				})

				// Media Units states
				.state('loggedin.mediauits', {
					url: '/mediaunits',
					templateUrl: 'mediaunits/templates/mediaunits.tpl.html'
				})

				// Sports Data states
				.state('loggedin.sportdata', {
					url: '/sportdata',
					templateUrl: 'sportdata/templates/sportdata.tpl.html'
				})

				// Poll States
				.state('loggedin.poll', {
					url: '/poll',
					templateUrl: 'poll/templates/poll.tpl.html'
				});
		})

		.run(function ($rootScope, $state, $stateParams, $location, $log, settings) {

			$rootScope.$state = $state;
			$rootScope.$stateParams = $stateParams;

		})

		.controller('AppCtrl', function ($scope, $location) {

		});
}());
