'use strict';

var appVersion  = '0.1',
    firebaseURL = 'https://tg-folio.firebaseIO.com';

// Declare app level module which depends on filters, and services
angular.module('portfolioApp',
    ['portfolio.filters', 'portfolio.services', 'portfolio.directives', 'portfolio.controllers', 'ngRoute', 'firebase']
  )

  // configure views; note the authRequired parameter for authenticated pages
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'partials/blog.html',
      controller: 'BlogCtrl'
    })

    .when('/posts/:id', {
      templateUrl: 'partials/blog-item.html',
      controller: 'PostCtrl'
    })

    .when('/tags/:tag', {
      templateUrl: 'partials/blog-tag.html',
      controller: 'TagCtrl'
    })

    .when('/cv', {
      templateUrl: 'partials/cv.html'
    })

    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    })

    .when('/add', {
      templateUrl: 'partials/add.html',
      controller: 'AddCtrl',
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