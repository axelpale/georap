

module.exports = function (socket, auth) {


  // Public methods

  this.fetchAll = function (callback) {
    // Get all locations from server.

    var payload = { token: auth.getToken() };

    socket.emit('locations/get', payload, function (response) {
      if (response.hasOwnProperty('locations')) {
        // Successful fetch.
        // Inform about new data.
        return callback(null, response.locations);
      }  // else

      if (response.hasOwnProperty('error')) {
        return callback(new Error(response.error));
      } // else

      throw new Error('invalid server response');
    });
  };

  this.fetchNearest = function () {
    // TODO
  };

};
