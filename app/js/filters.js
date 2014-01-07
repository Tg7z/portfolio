'use strict';

/* Filters */

angular.module('portfolio.filters', [])
  .filter('releaseDate', function(){
    // Filter out posts that aren't released
    return function(assets) {
      var now = new Date().getTime();
      var released = [];
      angular.forEach(assets, function(value, key) {
        if (typeof value === 'function') {
          // skip
        } else if (now > parseInt(value.release, 10)) {
          // maintain id for linking
          value.id = key;
          // keep released posts
          released.push(value);
        }
      });
      // sort most recent to least
      released.sort(function(a, b){
        a = parseInt(a.release);
        b = parseInt(b.release);
        return b - a;
      });
      return released;
    };
  })

  .filter('tileSize', function(){
    // Filter out posts that aren't released
    return function(assets) {
      angular.forEach(assets, function(value, i) {
        if (i === 0 || value.featured) {
          // first and featured items are always 2x2
          assets[i].size = 2;
        } else {
          // otherwise 1x1
          assets[i].size = 1;
        }
      });
      return assets;
    };
  })

  .filter('searchTag', function(){
    // Filter out posts that aren't released
    return function(assets, tag) {
      var results = {};
      angular.forEach(assets, function(value, key) {
        if (typeof value !== 'function') {
          // filter tags
          var tags = value.tags.map(function(elem) { return elem.toLowerCase(); });

          if (tags.indexOf(tag.toLowerCase()) >= 0) {
            results[key] = value;
          }
        }
      });
      return results;
    };
  })

  .filter('postTag', function(){
    // Only display posts tags for post detail page
    return function(tags, match) {
      if (match) {
        var results = [{}];
        angular.forEach(tags, function(value, key) {
          if (match.indexOf(key) >= 0) {
            results[key] = value;
          }
        });
        return results;
      } else {
        return tags;
      }
    };

  })

  .filter('searchQuery', function(){
    // Filter out posts that aren't released
    return function(assets, query) {
      var results = {};
      angular.forEach(assets, function(value, key) {
        if (typeof value === 'function') {
          // maintain $(firebase) functions
          results[key] = value;
        } else {
          var searchScore = 0;
          // Search rules
          var checkTag = function(q) {
            var tags = value.tags.map(function(elem) { return elem.toLowerCase(); });
            if (tags.indexOf(q) >= 0) { results[key] = value; }
          };

          if (query.q) {
            var q = query.q.toLowerCase();
            // check data based on specificity of search
            if (!query.t) { checkTag(q); }
            if (value.title.toLowerCase().indexOf(q) >= 0) { results[key] = value; }
            if (value.content.toLowerCase().indexOf(q) >= 0) { results[key] = value; }
          }
          // search tags
          if (query.t) { checkTag(query.t); }
        }
      });
      return results;
    };
  })

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
