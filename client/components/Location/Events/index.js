
var ui = require('georap-ui');
var template = require('./template.ejs');
var EventsView = require('../../Events');
var filters = require('pretty-events');
var locations = georap.stores.locations;

var eventFilter = function (evs) {
  var compactEvs = filters.dropEntryCommentDeleteGroups(evs);
  return compactEvs;
};

module.exports = function (locationId) {
  // Parameters:
  //   events
  //     EventsModel
  //
  var $mount = null;
  var $elems = {};
  var children = {};
  var handleNewEvent;

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template({
      __: georap.i18n.__,
    }));

    $elems.list = $mount.find('.location-events-list');
    $elems.progress = $mount.find('.location-events-progress');

    // Fetch events, ordered most recent first
    locations.getEvents({
      locationId: locationId,
    }, function (err, results) {
      ui.hide($elems.progress);
      if (err) {
        // TODO display error
        // ui.show($elems.error)
        console.error(err);
        return;
      }

      // TODO more

      var filteredEvents = eventFilter(results.events);
      children.events = new EventsView(filteredEvents);
      children.events.bind($elems.list);
    });

    handleNewEvent = function (locEv) {
      if (!children.events) { // ensure mounted
        return;
      }
      if (locEv.locationId !== locationId) {
        return;
      }
      children.events.prepend(locEv);
    };

    locations.on('location_event', handleNewEvent);
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      locations.off('location_event', handleNewEvent);
      handleNewEvent = null;
    }
  };
};
