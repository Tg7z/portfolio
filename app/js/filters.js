'use strict';

/* Filters */

angular.module('portfolio.filters', [])
  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  })

  .filter('nospace', function() {
    return function(input) {
      if (input) {
        return input.replace(/\s/g, '');
      }
    };
  })

  .filter('titlecase', function () {
    return function (input) {
      var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

      return input.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
        if (index > 0 && index + match.length !== title.length &&
          match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
          (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
          title.charAt(index - 1).search(/[^\s-]/) < 0) {
          return match.toLowerCase();
        }

        if (match.substr(1).search(/[A-Z]|\../) > -1) {
          return match;
        }

        return match.charAt(0).toUpperCase() + match.substr(1);
      });
    }
  });
