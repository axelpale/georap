
var pointstamp = require('../../lib/pointstamp');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var eventListTemplate = require('../../Events/list.ejs');
var filters = require('pretty-events');

var eventFilter = function (evs) {
  var compactEvs = filters.dropEntryCommentDeleteGroups(evs);
  return compactEvs;
};

module.exports = function (events) {
  // Parameters:
  //   events
  //     EventsModel

  var _handleCreated;

  this.bind = function ($mount) {

    $mount.html(template({
      eventList: eventListTemplate({
        timestamp: ui.timestamp,
        pointstamp: pointstamp,
        events: eventFilter(events.toRawArray()),
      }),
    }));

    _handleCreated = function () {
      // Refresh whole list
      $mount.html(eventListTemplate({
        timestamp: ui.timestamp,
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
