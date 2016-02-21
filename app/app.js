'use strict';

var fs = require('fs');

// Dependencies
require('ui-router');

var appModule = angular.module('SupportScheduler', ['ui.router']);

appModule
    .config(config)
    .run(run);

config.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
function config($locationProvider, $stateProvider, $urlRouterProvider) {
    $locationProvider.html5Mode({enabled: true, requireBase: false});
    $urlRouterProvider.otherwise('/login');

    $stateProvider
        .state('login', {
            url: '/login',
            template: fs.readFileSync(__dirname + '/login/login.html', 'utf8'),
            controller: 'loginController',
            controllerAs: 'loginCtrl'
        });
}

run.$inject = [];
function run() {
}

require('./login');

module.exports = appModule;