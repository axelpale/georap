
var timestamp = require('../../lib/timestamp');
var eventListTemplate = require('../../EventsList.ejs');

module.exports = function (events) {
  // Parameters:
  //   events
  //     EventsModel

  var _handleCreated;

  this.bind = function ($mount) {

    $mount.html(eventListTemplate({
      timestamp: timestamp,
      events: events.toRawArray(),
    }));

    _handleCreated = function () {
      // Refresh whole list
      $mount.html(eventListTemplate({
        timestamp: timestamp,
        events: events.toRawArray(),
      }));
    };

    events.on('location_event_created', _handleCreated);
  };

  this.unbind = function () {
    events.off('location_event_created', _handleCreated);
  };
};
