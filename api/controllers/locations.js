
var jwt = require('jsonwebtoken');
var local = require('../../config/local');

exports.get = function (db, data, response) {
  // Parameters
  //   db
  //     Monk db instance
  //   data
  //     JWT token and query filters
  //   response
  //     Socket.io response

  var token = data.token;
  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err) {
      // Problems with token
      response({
        error: 'invalid-token'
      });
    } else {
      // Give all locations. TODO take data and payload into account which
      // locations to fetch.
      var locations = db.get('locations');
      locations.find({}).then(function (locs) {
        response({
          locations: locs
        });
      }).catch(function (err) {
        console.error('api/controllers/locations.js');
        console.error(err);
        response({
          error: 'db-query-error'
        });
      });
    }
  });
};
