// Account controllers could be re-written to give a html/body level account state accessible to all elements
// Login and logout functionality would be housed there and the new/edit account functionality can be housed in seperate controllers

'use strict';

/* Controllers */

angular.module('portfolio.controllers', [])

  .controller('CoreCtrl',
    ['$scope', '$firebase', 'FBURL',
    function($scope, $firebase, FBURL) {
      var ref = new Firebase(FBURL);
      $scope.data = $firebase(ref);
  }])
  .controller('HomeCtrl',
    ['$scope',
    function($scope) {

  }]);