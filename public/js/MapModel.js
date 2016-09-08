var Emitter = require('component-emitter');

module.exports = function (socket, auth) {
  Emitter(this);
  var self = this;

  // Public methods

  this.fetchAll = function () {
    // Get all locations from server.
    var payload = { token: auth.getToken() };
    socket.emit('locationsRequest', payload, function (response) {
      if (response.hasOwnProperty('locations')) {
        // Successful fetch.
        // Inform about new data.
        self.emit('update', response.locations);
      } else if (response.hasOwnProperty('error')) {
        self.emit('error', new Error(response.error));
      }
    });
  };

  this.fetchNearest = function (point, limit) {
    // TODO
  };

  this.removeAll = function () {
    // Clear all data. Handy when user logs out.
    self.emit('update', []);
  };
};
