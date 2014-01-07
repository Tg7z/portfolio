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
    ['$scope', '$location', '$firebase', 'FBURL',
    function($scope, $location, $firebase, FBURL) {
      var refPosts = new Firebase(FBURL).child('/posts');
      $scope.posts = $firebase(refPosts);
      $scope.q = $location.search();
  }])

  .controller('PostCtrl',
    ['$scope', '$routeParams', '$firebase', 'FBURL',
    function($scope, $routeParams, $firebase, FBURL) {
      $scope.assetId = $routeParams.id;
      var refPost = new Firebase(FBURL).child('/posts/' + $scope.assetId);
      $scope.data = $firebase(refPost);
  }])

  .controller('TagCtrl',
    ['$scope', '$routeParams', '$firebase', 'FBURL',
    function($scope, $routeParams, $firebase, FBURL) {
      $scope.tag = $routeParams.tag;

      var refPosts = new Firebase(FBURL).child('/posts');
      $scope.posts = $firebase(refPosts);
  }])

  .controller('SearchCtrl',
    ['$scope', '$location', '$firebase', 'FBURL',
    function($scope, $location, $firebase, FBURL) {
      $scope.q = $location.search();

      var refPosts = new Firebase(FBURL).child('/posts');
      $scope.posts = $firebase(refPosts);
  }])

  .controller('TileGridCtrl',
    ['$scope', '$window', function($scope, $window) {
      $scope.rowHeight = 0;
      $scope.gridfillOptions = { cols: 4, tile_ratio: '4:3', selector: 'blog-posts', tileSelector: 'blog-post' };
      $scope.$parent.$on('ngRepeatFinished', function() {
        gridfill.initialize($scope.gridfillOptions);
      });
      $window.onresize = function() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (width >= 960) {
          gridfill.layoutGrid.bind(gridfill);
        }
      };
  }])

  .controller('TagCloudCtrl',
    ['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      var refTags = new Firebase(FBURL).child('/tags');
      $scope.tagData = $firebase(refTags);
  }])

  .controller('SidebarCtrl',
    ['$scope', '$location', function($scope, $location) {
      $scope.query = $location.search().q;
      $scope.keywordSearch = function() {
        $location.path('/search').search('q', $scope.query);
      };
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

        // Set default form values
        $scope.master = { author: "Tim Geurts", tags: [] };

        // Default tag list
        $scope.tagList = ["Portfolio", "JavaScript", "AngularJS", "AngularFire", "Firebase", "HTML", "CSS", "App"];
        $scope.tagData = $firebase(refTags);
        $scope.newTag = null;
      }
      init();

      // Date picker controls

      $scope.dateOptions = {
        'year-format': "'yy'",
        'starting-day': 1
      };

      $scope.openDate = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };

      // Tag controls

      $scope.tagData.$on('loaded', function (value) {
        var tags = [];
        angular.forEach(value, function(v, k){
          tags.push(k);
        });
        $scope.tagList = tags;
      });

      $scope.addTag = function() {
        $scope.post.tags.push($scope.newTag);
        // remove tag from autocomplete list
        var position = $scope.tagList.indexOf($scope.newTag);
        if ( ~position ) {
          $scope.tagList.splice(position, 1);
        }
        $scope.newTag = null;

      };

      $scope.removeTag = function(tag) {
        var position = $scope.post.tags.indexOf(tag);
        if ( ~position ) {
          $scope.post.tags.splice(position, 1);
        }
        // add tag back into autocomplete list
        $scope.tagList.push(tag);
        $scope.newTag = null;
      };

      // Form controls

      $scope.updateRelease = function() {
        var release_time = $scope.release_time;
        var release = $scope.release_date;
        if (release) {
          // update time based on user selected time
          release.setHours(release_time.getHours());
          release.setMinutes(release_time.getMinutes());
          release.setSeconds('00');
        } else {
          // fallback default to now
          release = new Date();
        }
        $scope.post.release = release.getTime();
      };

      $scope.resetRelease = function() {
        var now = new Date();
        $scope.release_date = now;
        $scope.release_time = now;
        $scope.master.release = now.getTime();
      }

      $scope.resetForm = function() {
        $scope.resetRelease();
        $scope.post = angular.copy($scope.master);
      };

      $scope.addNewPost = function() {
        var postName = '';
        // get date for use in post name
        var postDate = new Date($scope.post.release);
        var yyyy = postDate.getFullYear().toString();
        var mm = (postDate.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = postDate.getDate().toString();
        // build post name yyyy-mm-dd-title
        postName += (yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]) + '-');
        console.log(postName);
        postName += encodeURIComponent($scope.post.title.split(' ').join('-').toLowerCase());
        console.log(postName);
        var refPosts = new Firebase(FBURL).child('/posts/' + postName);
        // Get tags into array for incrementing counters
        var tags = $scope.post.tags;
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
          });
          allPromises.push( dfd.promise );
        });

        // Add promise for setting the post data
        var dfd = $q.defer();
        refPosts.set( $scope.post, function(error) {
          if (error) {
            dfd.reject(error);
          } else {
            dfd.resolve('post recorded');
          }
        });
        allPromises.push( dfd.promise );

        $q.all( allPromises ).then(
          function(){
            $scope.resetForm(); // or redirect to post
          },
          function(error){
            console.log(error);
            // error handling goes here how would I
            // roll back any data written to firebase
            alert('Error: something went wrong your post has not been created.');
          }
        );
      };

      $scope.resetForm();
  }]);