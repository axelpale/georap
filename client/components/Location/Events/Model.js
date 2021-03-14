// This module is responsible for manipulating raw events array of location.

var emitter = require('component-emitter');

module.exports = function (rawEvents, location) {
  // Parameters:
  //   events array of the raw location.

  var self = this;
  emitter(self);

  // Bind

  location.on('location_event_created', function (ev) {
    // Most recent is topmost
    rawEvents.unshift(ev);
    // For view
    self.emit('location_event_created');
  });

  // Public methods

  self.getLocation = function () {
    // Return location model
    return location;
  };

  self.toRawArray = function () {
    // Get raw events as array.
    return rawEvents;
  };
};
