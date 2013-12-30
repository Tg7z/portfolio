'use strict';

// Declare app level module which depends on filters, and services
angular.module('app',
    ['app.filters', 'app.services', 'app.directives', 'app.controllers', 'ngRoute', 'firebase']
  )

  // configure views; note the authRequired parameter for authenticated pages
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'partials/home.html',
      controller: 'HomeCtrl'
    })

    .otherwise({ redirectTo: '/' });
  }])

  // version of this app
  .constant('version', '0.1')

  // your Firebase URL goes here
  .constant('FBURL', 'https://[firebaseURL].firebaseIO.com')

  // establish authentication
  .run(['$rootScope', 'FBURL', function($rootScope, FBURL) {
    $rootScope.FBURL = FBURL;
  }]);