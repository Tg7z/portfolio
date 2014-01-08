'use strict';

/* Filters */

angular.module('portfolio.filters', [])
  .filter('releaseDate', function(){
    // Filter out posts that aren't released
    return function(posts) {
      var now = new Date().getTime();
      var released = [];
      angular.forEach(posts, function(value, key) {
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

  .filter('excludePost', function() {
    // Exclude currently displayed post
    // can pass in string or array of strings
    return function(posts, exclude) {
      if (exclude) {
        angular.forEach(posts, function(value, key) {
          if (typeof exclude === 'string') {
            if (key === exclude) {
              delete posts[exclude];
            }
          } else {
            var excludeKey = exclude.indexOf(key);
            if (~excludeKey) {
              var deleteKey = exclude[excludeKey];
              delete posts[deleteKey];
            }
          }
        });
      }
      return posts;
    };
  })

  .filter('tileSize', function(){
    // Filter out posts that aren't released
    return function(posts) {
      angular.forEach(posts, function(value, i) {
        if (i === 0 || value.featured) {
          // first and featured items are always 2x2
          posts[i].size = 2;
        } else {
          // otherwise 1x1
          posts[i].size = 1;
        }
      });
      return posts;
    };
  })

  .filter('searchTag', function(){
    // Filter out posts that aren't released
    return function(posts, tag) {
      var results = {};
      angular.forEach(posts, function(value, key) {
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
        var results = {};
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
    return function(posts, query) {
      var results = {};
      angular.forEach(posts, function(value, key) {
        if (typeof value === 'function') {
          // maintain $(firebase) functions
          results[key] = value;
        } else {
          // Search rules
          var checkTag = function(q) {
            // search only if data exists
            if (value.tags) {
              var tags = value.tags.map(function(elem) { return elem.toLowerCase(); });
              if (tags.indexOf(q) >= 0) { results[key] = value; }
            }
          };

          var checkVia = function(q) {
            // search only if data exists
            if (value.via){
              if (value.via.label) {
                var viaLabel = value.via.label.toLowerCase();
                if (viaLabel.indexOf(q) >= 0) { results[key] = value; }
              }
              if (value.via.link) {
                var viaLink = value.via.link.toLowerCase();
                if (viaLink.indexOf(q) >= 0) { results[key] = value; }
              }
            }
          };

          if (query.q) {
            var queries = query.q.split(' ').map(function(elem) { return elem.toLowerCase(); });
            var titleWords = value.title.split(' ').map(function(elem) { return elem.toLowerCase(); });
            var contentWords = value.content.split(' ').map(function(elem) { return elem.toLowerCase(); });
            // check data based on specificity of search
            if (!query.t) { angular.forEach(queries, function(q, i){ checkTag(q); }); }
            if (!query.v) { angular.forEach(queries, function(q, i){ checkVia(q); }); }
            // search individual words
            angular.forEach(titleWords, function(word, i){
              angular.forEach(queries, function(q, i){
                if (word.indexOf(q) >= 0) { results[key] = value; }
              });
            });
            angular.forEach(titleWords, function(word, i){
              angular.forEach(queries, function(q, i){
                if (word.indexOf(q) >= 0) { results[key] = value; }
              });
            });
          }
          // search tags
          if (query.t) { checkTag(query.t.toLowerCase()); }
          // search via
          if (query.v) { checkVia(query.v.toLowerCase()); }
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
