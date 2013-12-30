'use strict';

/* Directives */


angular.module('app.directives', [])
  // Prevent default on <a> tags with an href of "#", "" or an ng-click attribute
  .directive('a', function() {
    return {
      restrict: 'E',
      link: function(scope, elem, attrs) {
        if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
          elem.on('click', function(e){
            e.preventDefault();
            if(attrs.ngClick){
              scope.$eval(attrs.ngClick);
            }
          });
        }
      }
    };
  });
