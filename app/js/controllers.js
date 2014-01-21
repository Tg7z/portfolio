// Account controllers could be re-written to give a html/body level account state accessible to all elements
// Login and logout functionality would be housed there and the new/edit account functionality can be housed in seperate controllers

'use strict';

/* Controllers */

angular.module('portfolio.controllers', [])

  .controller('CoreCtrl',
    ['$rootScope', '$scope', '$firebase', 'loginService', 'FBURL',
    function($rootScope, $scope, $firebase, loginService, FBURL) {
      // Set default page title and allow it to be changed in child controllers
      $scope.pagetitle = {};
      $scope.pagetitle.pagename = "Didacticode";
      $scope.mobilemenu = false;

      var refBio = new Firebase(FBURL).child('/bio');
      $scope.bio = $firebase(refBio);

      $scope.logout = function() {
        loginService.logout('/login');
      };
      $scope.openMenu = function() {
        console.log('open menu');
        $scope.mobilemenu = true;
      };
      $scope.closeMenu = function() {
        console.log('close menu');
        $scope.mobilemenu = false;
      };
  }])

  .controller('BlogCtrl',
    ['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      $scope.pagetitle.pagename = "All Posts - Didacticode";
      var refPosts = new Firebase(FBURL).child('/posts');
      $scope.posts = $firebase(refPosts);
  }])

  .controller('PostCtrl',
    ['$scope', '$sce', '$routeParams', '$firebase', 'FBURL',
    function($scope, $sce, $routeParams, $firebase, FBURL) {
      $scope.postId = $routeParams.id;
      var refPost = new Firebase(FBURL).child('/posts/' + $scope.postId);
      $scope.data = $firebase(refPost);
      $scope.data.$on('change', function() {
        var title = $scope.data.title
        if (title) {
          $scope.pagetitle.pagename = title + " - Didacticode";
        }
      });
      $scope.htmlUnsafe = function() {
        return $sce.trustAsHtml($scope.data.content);
      };
  }])

  .controller('TagCtrl',
    ['$scope', '$routeParams', '$firebase', 'FBURL',
    function($scope, $routeParams, $firebase, FBURL) {
      $scope.tag = $routeParams.tag;
      $scope.pagetitle.pagename = "Posts tagged " + $scope.tag + " - Didacticode";
      var refPosts = new Firebase(FBURL).child('/posts');
      $scope.posts = $firebase(refPosts);
  }])

  .controller('SearchCtrl',
    ['$scope', '$location', '$firebase', 'FBURL',
    function($scope, $location, $firebase, FBURL) {
      $scope.q = $location.search();
      $scope.pagetitle.pagename = "Search results - Didacticode";
      var refPosts = new Firebase(FBURL).child('/posts');
      $scope.posts = $firebase(refPosts);
  }])

  .controller('RecentPostsCtrl',['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      var refPosts = new Firebase(FBURL).child('/posts').limit(10);
      $scope.recentPosts = $firebase(refPosts);
  }])

  .controller('TileGridCtrl',
    ['$scope', '$window', function($scope, $window) {
      $scope.rowHeight = 0;
      $scope.gridfillOptions = { cols: 3, tile_ratio: '4:3', selector: 'blog-posts', tileSelector: 'blog-post' };
      $scope.$parent.$on('ngRepeatFinished', function() {
        gridfill.initialize($scope.gridfillOptions);
      });
      $window.onresize = function() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (width >= 960) {
          gridfill.layoutGrid();
        }
      };
  }])

  .controller('TagCloudCtrl',
    ['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      var refTags = new Firebase(FBURL).child('/tags');
      $scope.tagData = $firebase(refTags);
  }])

  .controller('HeaderCtrl',
    ['$scope', '$location', function($scope, $location) {
      $scope.query = $location.search().q;
      $scope.keywordSearch = function() {
        if (this.query) {
          $location.path('/search').search('q', this.query);
        }
      };
  }])

  .controller('CvCtrl',
    ['$scope', function($scope) {
      $scope.pagetitle.pagename = "Curriculum Vitae of Tim Geurts - Didacticode";
  }])

  .controller('BioCtrl',
    ['$scope', function($scope) {
      $scope.pagetitle.pagename = "More about the author: Tim Geurts - Didacticode";
  }])

  .controller('LoginCtrl',
    ['$scope', 'loginService', function($scope, loginService) {
      $scope.pagetitle.pagename = "Login - Didacticode";
      $scope.email = null;
      $scope.pass = null;
      $scope.remember = true;

      $scope.login = function(callback) {
        $scope.err = null;
        var redirectTo = '/add';
        loginService.login(this.email, this.pass, this.remember, redirectTo, function(err, user) {
          $scope.err = err||null;
          typeof(callback) === 'function' && callback(err, user);
        });
      };
  }])

  .controller('AddEditCtrl',
    ['$scope', '$q', '$routeParams', '$location', '$firebase', 'FBURL',
    function($scope, $q, $routeParams, $location, $firebase, FBURL) {
      var init = function init() {
        var refTags = new Firebase(FBURL).child('/tags');

        $scope.editId = $routeParams.id;
        if ($scope.editId) {
          // current data is the default
          $scope.pageHeading = 'Edit post: ';
          var refPost = new Firebase(FBURL).child('/posts/' + $scope.editId);
          $scope.master = $firebase(refPost);
          // set data in form when its loaded from firebase
          $scope.master.$on('change', function() {
            $scope.pageHeading = 'Edit post: ' + $scope.master.title;
            $scope.pagetitle.pagename = "Edit " + $scope.master.title + " - Didacticode";
            // remove any AngularFire function
            angular.forEach($scope.master, function(value, key){
              if (typeof value === 'function') {
                delete $scope.master[key];
              }
            });
            if (!$scope.master.tags) {
              $scope.master.tags = [];
            }
            $scope.resetForm();
          });
        } else {
          $scope.pageHeading = 'Add Post';
          $scope.pagetitle.pagename = "Add Post - Didacticode";
          // Set default form values
          $scope.master = { author: "Tim Geurts", tags: [] };
        }

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
      };

      $scope.resetForm = function() {
        if ($scope.editId) {
          var release;
          // populate minutes and date fields
          if ($scope.master.release) {
            release = new Date($scope.master.release);
          } else {
            release = new Date();
          }
          $scope.release_time = release;
          $scope.release_date = release;
          // update autocomplete field
          var masterTags = $scope.master.tags;
          angular.forEach(masterTags, function(value, i){
            var position = $scope.tagList.indexOf(value);
            if ( ~position ) {
              $scope.tagList.splice(position, 1);
            }
          });
        } else {
          // only reset release if creating new post
          $scope.resetRelease();
        }
        $scope.post = angular.copy($scope.master);
      };

      $scope.savePost = function() {
        var refPosts;
        // new post so build post name
        var postName = '';
        if ($scope.editId) {
          // edit post so use known FBURL
          refPosts = new Firebase(FBURL).child('/posts/' + $scope.editId);
        } else {
          // get date for use in post name
          var postDate = new Date($scope.post.release);
          var yyyy = postDate.getFullYear().toString();
          var mm = (postDate.getMonth()+1).toString(); // getMonth() is zero-based
          var dd  = postDate.getDate().toString();
          // build post name yyyy-mm-dd-title
          postName += (yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]) + '-');
          postName += encodeURIComponent($scope.post.title.split(' ').join('-').split('.').join('-').toLowerCase());
          refPosts = new Firebase(FBURL).child('/posts/' + postName);
        }
        // Get tags into array for incrementing counters
        var incrementTags = null;
        var decrementTags = null;
        if ($scope.editId) {
          // when editing we only want to increment tags that didm't already exist
          // and decrement and removed tags
          var tags = $scope.post.tags.slice(0);
          var masterTags = $scope.master.tags.slice(0);
          angular.forEach(masterTags, function(value, i){
            var match = tags.indexOf(value);
            // if both arrays have the tag remover from both
            if ( ~match ) {
              delete tags[match];
              delete masterTags[i];
            }
            // anything left in tags is a new tag
            incrementTags = tags;
            // anything left in masterTags is a tag that has been removed
            decrementTags = masterTags;
          });
        } else {
          incrementTags = $scope.post.tags;
        }
        var allPromises = [];

        // increment/decrement based on passed values
        var updateTags = function(value, index, increment) {
          var dfd = $q.defer();
          var refTag = new Firebase(FBURL).child('/tags/' + value);
          refTag.transaction( function (current_value) {
            if (increment) {
              return current_value + 1;
            } else {
              return current_value - 1;
            }

          }, function(error, committed, snapshot) {
            if (committed) {
              dfd.resolve( snapshot );
            } else {
              dfd.reject( error );
            }
          });
          allPromises.push( dfd.promise );
        };
        if (incrementTags) {
          // Iterate through tags and set promises for transactions to increment tag count
          angular.forEach(incrementTags, function(value, index){
            updateTags(value, index, true);
          });
        }
        if (decrementTags) {
          // Iterate through tags and set promises for transactions to decrement tag count
          angular.forEach(decrementTags, function(value, index){
            updateTags(value, index, false);
          });
        }

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
            var postId;
            if ($scope.editId) {
              postId = $scope.editId;
            } else {
              postId = postName;
            }
            $location.path('/posts/' + postId);
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