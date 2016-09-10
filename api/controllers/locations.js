
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
      // Give all locations. TODO take payload into account
      response({
        locations: [
          {
            id: 23,
            name: 'Kalkkipetteri',
            lat: 60.189287,
            lng: 23.983326
          }
        ]
      });
    }
  });
};
