
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

  jwt.verify(data.token, local.secret, function (err) {
    if (err) {
      // Problems with token

      return response({
        error: 'invalid-token',
      });
    }  // else

    // Give all locations. TODO take data and payload into account which
    // locations to fetch.
    var locations = db.get('locations');

    locations.find({}).then(function (locs) {
      return response({
        locations: locs,
      });
    }).catch(function (err2) {
      console.error('api/controllers/locations.js');
      console.error(err2);

      return response({
        error: 'db-query-error',
      });
    });
  });
};
