/* eslint-disable no-unused-vars */

var timestamp = require('../../lib/timestamp');
var eventListTemplate = require('../../EventsList.ejs');

module.exports = function (location) {

  var events = location.getRawEvents();

  this.bind = function ($mount) {

    $mount.html(eventListTemplate({
      timestamp: timestamp,
      events: events,
    }));

  };

  this.unbind = function () {
    // Noop
  };
};
