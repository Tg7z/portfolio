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

  .controller('TagCloudCtrl',
    ['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      var refTags = new Firebase(FBURL).child('/tags');
      $scope.tagData = $firebase(refTags);
  }])

  .controller('LoginCtrl',
    ['$scope', 'loginService', function($scope, loginService) {
      $scope.email = null;
      $scope.pass = null;
      $scope.remember = true;

      $scope.login = function(callback) {
        $scope.err = null;
        var redirectTo = '/add';
        loginService.login($scope.email, $scope.pass, $scope.remember, redirectTo, function(err, user) {
          $scope.err = err||null;
          typeof(callback) === 'function' && callback(err, user);
        });
      };
  }])

  .controller('AddCtrl',
    ['$scope', '$q', '$firebase', 'FBURL',
    function($scope, $q, $firebase, FBURL) {
      var init = function init() {
        var refTags = new Firebase(FBURL).child('/tags');
        var date = new Date();
        var today = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        // Set default form values
        $scope.master = { release: today, author: "Tim Geurts", tags: [] };
        $scope.tagData = $firebase(refTags);
        $scope.newTag = null;
      }
      init();

      $scope.tagData.$on('loaded', function (value) {
        var tags = [];
        angular.forEach(value, function(v, k){
          tags.push(k);
        });
        $scope.tagList = tags;
      })

      $scope.reset = function() {
        $scope.post = angular.copy($scope.master);
      };

      $scope.addTag = function() {
        $scope.post.tags.push($scope.newTag);
        // remove tag from autocomplete list
        var position = $scope.tagList.indexOf($scope.newTag);
        if ( ~position ) {
          $scope.tagList.splice(position, 1);
        }
        $scope.newTag = '';

      };

      $scope.removeTag = function(tag) {
        console.log('remove ' + tag);
        var position = $scope.post.tags.indexOf(tag);
        if ( ~position ) {
          $scope.post.tags.splice(position, 1);
        }
        // add tag back into autocomplete list
        $scope.tagList.push(tag);
        $scope.newTag = '';
      };

      $scope.addNewPost = function() {
        var refPosts = new Firebase(FBURL).child('/posts').push();
        // Get tags into array for incrementing counters
        var tags = $scope.post.tags.split(', ');
        var allPromises = [];
        // Iterate through tags and set promises for transactions to increment tag count
        angular.forEach(tags, function(value, index){
          var dfd = $q.defer();
          var refTag = new Firebase(FBURL).child('/tags/' + value);
          refTag.transaction( function (current_value) {
            return current_value + 1;
          }, function(error, committed, snapshot) {
            if (committed) {
              dfd.resolve( snapshot );
            } else {
              dfd.reject( error );
            }
            allPromises.push( dfd.promise );
          });
        });

        // Add promise for setting the post data
        var dfd = $q.defer();
        refPosts.set( $scope.post, function(error) {
          if (error) {
            dfd.reject(error);
          } else {
            dfd.resolve('post recorded');
          }
          allPromises.push( dfd.promise );
        });

        $q.all( allPromises ).then(
          function(){
            $scope.reset(); // or redirect to post
          },
          function(){
            // error handling goes here how would I
            // roll back any data written to firebase
            alert('Error: something went wrong your post has not been created.');
          }
        );
      };

      $scope.reset();
  }]);