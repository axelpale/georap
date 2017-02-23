/* eslint-disable no-unused-vars */

var timestamp = require('../../lib/timestamp');
var eventListTemplate = require('../../EventsList.ejs');

module.exports = function (location) {

  var handleEvent;
  var events = location.getRawEvents();

  this.bind = function ($mount) {

    $mount.html(eventListTemplate({
      timestamp: timestamp,
      events: events,
    }));

    handleEvent = function (ev) {
      // Refresh state
      events = location.getRawEvents();
      // Refresh html
      $mount.html(eventListTemplate({
        timestamp: timestamp,
        events: events,
      }));
    };

    location.on('location_event_created', handleEvent);
  };

  this.unbind = function () {
    location.off('location_event_created', handleEvent);
  };
};
