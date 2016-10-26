
var jwt = require('jsonwebtoken');
var local = require('../../config/local');
var errors = require('../errors');
var clustering = require('../services/clustering');

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

      return response(errors.responses.InvalidTokenError);
    }  // else

    // Give all locations. TODO take data and payload into account which
    // locations to fetch.
    var locations = db.get('locations');

    locations.find({}).then(function (locs) {
      return response({
        locations: locs,
      });
    }).catch(function (err2) {
      console.error(err2);

      return response({
        error: 'db-query-error',
      });
    });
  });
};

exports.getWithin = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     token
  //       JWT token
  //     center
  //       [lng, lat] array
  //     radius
  //       max distance from the center in meters
  //     layer
  //       equals to zoom level. Get only locations on this and higher layers.
  //   response
  //     Socket.io response

  // Validate the request to prevent injection
  var validRequest = (data.hasOwnProperty('token') &&
                      typeof data.token === 'string' &&
                      data.hasOwnProperty('center') &&
                      typeof data.center === 'object' &&
                      typeof data.center[0] === 'number' &&
                      typeof data.center[1] === 'number' &&
                      'length' in data.center &&
                      data.center.length === 2 &&
                      data.hasOwnProperty('radius') &&
                      typeof data.radius === 'number') &&
                      data.hasOwnProperty('layer') &&
                      typeof data.layer === 'number';

  if (!validRequest) {
    console.log('Invalid request');
    console.log(data);

    return response(errors.responses.InvalidRequestError);
  }  // else

  jwt.verify(data.token, local.secret, function (err) {
    if (err) {
      // Problems with token

      return response(errors.responses.InvalidTokenError);
    }  // else

    clustering.findWithin({
      db: db,
      center: data.center,
      radius: data.radius,
      // Only locations on the layer or higher (smalle layer number).
      query: { layer: { $lte: data.layer } },
      callback: function (err2, locs) {
        if (err2) {
          console.error(err2);

          return response(errors.responses.DatabaseError);
        }  // else

        return response({
          locations: locs,
        });
      },
    });

  });
};
