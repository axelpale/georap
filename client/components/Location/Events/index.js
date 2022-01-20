
var ui = require('georap-ui');
var template = require('./template.ejs');
var EventsView = require('../../Events');
var filters = require('pretty-events');

var eventFilter = function (evs) {
  var compactEvs = filters.dropEntryCommentDeleteGroups(evs);
  return compactEvs;
};

module.exports = function (events) {
  // Parameters:
  //   events
  //     EventsModel

  var $mount = null;
  var _handleCreated;
  var children = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      __: georap.i18n.__,
    }));

    var filteredEvents = eventFilter(events.toRawArray());
    children.events = new EventsView(filteredEvents);
    children.events.bind($mount.find('.location-events-list'));

    _handleCreated = function () {
      // Refresh whole list
      var updatedEvents = eventFilter(events.toRawArray());
      children.events.update(updatedEvents);
    };

    events.on('location_event_created', _handleCreated);
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      events.off('location_event_created', _handleCreated);
    }
  };
};
