// General interface to server API.
//
// Usage:
//  var api = new Api(socket);

var TOKEN_KEY = 'tresdb-session-token';
var socket = require('../connection/socket');
var storage = require('../connection/storage');

exports.requestRaw = function (route, payload, callback) {
  // No authentication
  //
  // Parameters:
  //   route
  //     string
  //   payload
  //     plain object
  //   callback
  //     function (err, successResponseData)

  socket.emit(route, payload, function (response) {
    var err;

    if (response.hasOwnProperty('success')) {
      return callback(null, response.success);
    }

    if (response.hasOwnProperty('error')) {
      err = new Error(response.error);
      err.name = response.error;  // Name prop is for machine readable.
      return callback(err);
    }

    throw new Error('invalid server response');
  });
};

exports.request = function (route, payload, callback) {
  // Authenticated API call. Falls back to unauthenticated API call
  // if user is not authenticated. Daa.

  var token = storage.getItem(TOKEN_KEY);

  if (token !== null) {
    payload.token = token;
  }

  return exports.requestRaw(route, payload, callback);
};

exports.getTokenKey = function () {
  return TOKEN_KEY;
};
