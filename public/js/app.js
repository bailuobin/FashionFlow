'use strict';

var app = angular.module('FashionFlow', ['ngRoute']).
config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider
    .when('/hello', {
        templateUrl: 'index.html'
    });

    $locationProvider.html5Mode({
    	enabled: true,
    requireBase: false
    }).hashPrefix('!');
}]);

