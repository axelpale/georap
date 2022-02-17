
var ui = require('georap-ui');
var template = require('./template.ejs');
var EventsMoreView = require('../../EventsMore');
var filters = require('pretty-events');
var locationsApi = georap.stores.locations;

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

    $elems.events = $mount.find('.location-events-list');

    children.events = new EventsMoreView(function (skip, limit, callback) {
      locationsApi.getEvents({
        locationId: locationId,
        skip: skip,
        limit: limit,
      }, callback);
    }, {
      listSize: 20,
      eventFilter: eventFilter,
    });
    children.events.bind($elems.events);

    handleNewEvent = function (locEv) {
      if (!children.events) { // ensure mounted
        return;
      }
      if (locEv.locationId !== locationId) {
        return;
      }
      children.events.prepend(locEv);
    };

    locationsApi.on('location_event', handleNewEvent);
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      locationsApi.off('location_event', handleNewEvent);
      handleNewEvent = null;
    }
  };
};
