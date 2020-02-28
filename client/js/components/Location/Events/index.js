
var pointstamp = require('../../lib/pointstamp');
var timestamp = require('../../lib/timestamp');
var template = require('./template.ejs');
var eventListTemplate = require('../../Events/list.ejs');

module.exports = function (events) {
  // Parameters:
  //   events
  //     EventsModel

  var _handleCreated;

  this.bind = function ($mount) {

    $mount.html(template({
      eventList: eventListTemplate({
        timestamp: timestamp,
        pointstamp: pointstamp,
        events: events.toRawArray(),
      }),
    }));

    _handleCreated = function () {
      // Refresh whole list
      $mount.html(eventListTemplate({
        timestamp: timestamp,
        pointstamp: pointstamp,
        events: events.toRawArray(),
      }));
    };

    events.on('location_event_created', _handleCreated);
  };

  this.unbind = function () {
    events.off('location_event_created', _handleCreated);
  };
};
