(function() {
  'use strict';

  /* Services */

  angular.module('app.services', [])

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
    });

  function errMsg(err) {
    return err? '['+err.code+'] ' + err.toString() : null;
  }
})();

