// Account controllers could be re-written to give a html/body level account state accessible to all elements
// Login and logout functionality would be housed there and the new/edit account functionality can be housed in seperate controllers

'use strict';

/* Controllers */

angular.module('portfolio.controllers', [])

  .controller('CoreCtrl',
    ['$rootScope', '$scope', '$firebase', 'loginService', 'FBURL',
    function($rootScope, $scope, $firebase, loginService, FBURL) {
      var refBio = new Firebase(FBURL).child('/bio');
      $scope.bio = $firebase(refBio);

      $scope.logout = function() {
        loginService.logout('/login');
      };
  }])

  .controller('BlogCtrl',
    ['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      var refBlog = new Firebase(FBURL).child('/blog');
      $scope.posts = $firebase(refBlog);
  }])

  .controller('PostCtrl',
    ['$scope', '$routeParams', '$firebase', 'FBURL',
    function($scope, $routeParams, $firebase, FBURL) {
      $scope.assetId = $routeParams.id;
      var refPost = new Firebase(FBURL).child('/blog/' + $scope.assetId);
      $scope.data = $firebase(refPost);
  }])

  .controller('TagCtrl',
    ['$scope', '$routeParams', '$firebase', 'FBURL',
    function($scope, $routeParams, $firebase, FBURL) {
      $scope.tag = $routeParams.tag;

      var refBlog = new Firebase(FBURL).child('/blog');
      $scope.data = $firebase(refBlog);
  }])

  .controller('LoginCtrl',
    ['$scope', 'loginService', function($scope, loginService) {
      $scope.email = null;
      $scope.pass = null;

      $scope.login = function(callback) {
        $scope.err = null;
        var redirectTo = '/add';
        loginService.login($scope.email, $scope.pass, redirectTo, function(err, user) {
          $scope.err = err||null;
          typeof(callback) === 'function' && callback(err, user);
        });
      };
  }])

  .controller('AddCtrl',
    ['$scope', 'FBURL',
    function($scope, FBURL) {
      var init = function init() {
        var date = new Date();
        var today = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        // Set default form values
        $scope.master = { release: today, author: "Tim Geurts" };
      }
      init();

      $scope.reset = function() {
        $scope.post = angular.copy($scope.master);
      };

      $scope.addNewPost = function() {
        var ref = new Firebase(FBURL).child('/posts').push();
        var onComplete = function(error) {
          if (error) {
            alert('Error: Something went wrong when creating your post please try again');
            throw new Error(error);
          }
          else {
            $scope.reset(); // or redirect to post
          }
        };
        ref.set($scope.post, onComplete);
      };

      $scope.reset();
  }]);