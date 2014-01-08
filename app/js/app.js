'use strict';

var appVersion  = '0.1',
    firebaseURL = 'https://tg-folio.firebaseIO.com';

// Declare app level module which depends on filters, and services
angular.module('portfolioApp',
    ['portfolio.filters', 'portfolio.services', 'portfolio.directives',
    'portfolio.controllers', 'ngRoute', 'firebase', 'ui.bootstrap', 'ngSanitize']
  )

  // configure views; note the authRequired parameter for authenticated pages
  .config(['$routeProvider', function($routeProvider) {
  //.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider.when('/', {
      templateUrl: 'partials/blog.html',
      controller: 'BlogCtrl'
    })

    .when('/posts/:id', {
      templateUrl: 'partials/blog-item.html',
      controller: 'PostCtrl'
    })

    .when('/posts/:id/edit', {
      templateUrl: 'partials/add.html',
      controller: 'AddEditCtrl',
      authRequired: true
    })

    .when('/tags/:tag', {
      templateUrl: 'partials/blog-tag.html',
      controller: 'TagCtrl'
    })

    .when('/search', {
      templateUrl: 'partials/search.html',
      controller: 'SearchCtrl'
    })

    .when('/cv', {
      templateUrl: 'partials/cv.html'
    })

    .when('/bio', {
      templateUrl: 'partials/bio.html'
    })

    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    })

    .when('/add', {
      templateUrl: 'partials/add.html',
      controller: 'AddEditCtrl',
      authRequired: true
    })

    .otherwise({ redirectTo: '/' });
  }])

  // version of this app
  .constant('version', appVersion)

  // your Firebase URL goes here
  .constant('FBURL', firebaseURL)

  // establish authentication
  .run(['$rootScope', '$firebaseAuth', 'FBURL',
    function($rootScope, $firebaseAuth, FBURL) {
      var ref = new Firebase(FBURL);
      $rootScope.auth = $firebaseAuth(ref, { path: '/login' });
      $rootScope.FBURL = FBURL;
  }]);

  angular.module('cvApp',
      ['portfolio.filters', 'portfolio.services', 'portfolio.directives', 'portfolio.controllers', 'ngRoute', 'firebase']
    )

    // version of this app
    .constant('version', appVersion)

    // your Firebase URL goes here
    .constant('FBURL', firebaseURL)

    // establish authentication
    .run(['$rootScope', 'FBURL', function($rootScope, FBURL) {
      $rootScope.FBURL = FBURL;
    }]);