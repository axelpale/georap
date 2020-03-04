
var pointstamp = require('../../lib/pointstamp');
var timestamp = require('../../lib/timestamp');
var template = require('./template.ejs');
var eventListTemplate = require('../../Events/list.ejs');
var filters = require('pretty-events');

var eventFilter = function (evs) {
  var filteredEvs = filters.dropEntryCommentDeleteGroups(evs);
  filteredEvs = filters.mergeTagged(evs);
  return filteredEvs;
};

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
        events: eventFilter(events.toRawArray()),
      }),
    }));

    _handleCreated = function () {
      // Refresh whole list
      $mount.html(eventListTemplate({
        timestamp: timestamp,
        pointstamp: pointstamp,
        events: eventFilter(events.toRawArray()),
      }));
    };

    events.on('location_event_created', _handleCreated);
  };

  this.unbind = function () {
    events.off('location_event_created', _handleCreated);
  };
};
