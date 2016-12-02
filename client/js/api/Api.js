// General interface to server API.
//
// Usage:
//  var api = new Api(socket);

var TOKEN_KEY = 'tresdb-session-token';

module.exports = function (socket) {
  // Parameters:
  //   socket
  //     socket.io socket

  this.requestRaw = function (route, payload, callback) {
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
      if (response.hasOwnProperty('success')) {
        return callback(null, response.success);
      }

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      }

      throw new Error('invalid server response');
    });
  };

  this.request = function (route, payload, callback) {
    // Authenticated API call. Falls back to unauthenticated API call
    // if user is not authenticated. Daa.

    var token = storage.getItem(TOKEN_KEY);

    if (token !== null) {
      payload.token = token;
    }

    return this.requestRaw(route, payload, callback);
  };

  this.getTokenKey = function () {
    return TOKEN_KEY;
  };

};
