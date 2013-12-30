(function() {
  'use strict';

  /* Services */

  angular.module('portfolio.services', [])

    .factory('isEmpty', function(){
      return function(obj){
        // null and undefined are "empty"
        if (obj === null || obj === undefined) { return true; }
        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length && obj.length > 0) { return false; }
        if (obj.length === 0) { return true; }
        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and toValue enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) { return false; }
        }
        // Otherwise assume empty
        return true;
      };
    })

    .factory('loginService',
      ['$rootScope', '$location', 'FBURL',
      function($rootScope, $location, FBURL) {
        return {
          /**
           * @param {string} email
           * @param {string} pass
           * @param {string} [redirect]
           * @param {Function} [callback]
           * @returns {*}
           */

          login: function(email, pass, redirect, callback) {
            $rootScope.auth.$login('password', {
              email: email,
              password: pass,
              rememberMe: true
            }).then(function(user) {
              if( redirect ) {
                $location.path(redirect);
              }
              callback && callback(null, user);
            }, callback);
          },

          /**
           * @param {string} [redirectPath]
           */
          logout: function(redirectPath) {
            $rootScope.auth.$logout();
            if( redirectPath ) {
              $location.path(redirectPath);
            }
          }
        };
    }]);

  function errMsg(err) {
    return err? '['+err.code+'] ' + err.toString() : null;
  }
})();

