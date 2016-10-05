var queryString = require('query-string');

module.exports = function () {

  this.hash = {
    has: function (key) {
      // Return
      //   true
      //     the query string in the has has the key
      //   false
      //     otherwise
      var p = queryString.parse(location.hash);

      // parse returns an object without prototype, so without hasOwnProperty.
      return (key in p);
    },

    get: function (key) {
      var p = queryString.parse(location.hash);

      if (key in p) {

        return p[key];
      }  // else

      return null;
    },
  };
};
