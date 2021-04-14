// Component to list filtered lists of events.
//
var emitter = require('component-emitter');
var prettyEvents = require('pretty-events');
var ui = require('tresdb-ui');
var template = require('./template.ejs');
var EventsView = require('../../Events');
var LocationSelector = require('../LocationSelector');
var rootBus = require('tresdb-bus');
var models = require('tresdb-models');
var eventsStore = tresdb.stores.events;

var LIST_SIZE = 100;

module.exports = function () {
  // Init
  var self = this;
  emitter(self);
  var $mount = null;
  var children = {};
  var $elems = {};
  var localBus = models.bus(rootBus);

  // Public methods

  self.bind = function ($mountEl, filter) {
    $mount = $mountEl;

    if (!filter) {
      filter = function () {
        return true;
      };
    }

    $mount.html(template());

    // Set up view for events
    $elems.events = $mount.find('.latest-events');
    children.events = new EventsView([]);
    children.events.bind($elems.events);

    // Select associated marker by clicking an event or hovering cursor on it.
    children.selector = new LocationSelector();
    children.selector.bind($elems.events);

    // Update events on any new event
    localBus.on('socket_event', function () {
      self.update(filter);
    });

    // Initial event fetch and list render
    self.update(filter);
  };

  self.update = function (filter) {
    if ($mount) {
      // Reload events and render
      eventsStore.getRecent({
        skip: 0,
        limit: LIST_SIZE,
      }, function (err, events) {
        // Ensure loading bar is hidden.
        ui.hide($mount.find('.latest-events-progress'));

        if (err) {
          console.error(err);
          return;
        }

        // Collect location data in events. Use to emphasize map markers.
        children.selector.readMarkerLocationsFromEvents(events);

        var compactEvs = prettyEvents.mergeLocationCreateRename(events);
        compactEvs = prettyEvents.mergeEntryCreateEdit(compactEvs);
        compactEvs = prettyEvents.dropEntryCommentDeleteGroups(compactEvs);
        compactEvs = prettyEvents.dropEntryCommentChanged(compactEvs);
        compactEvs = prettyEvents.mergeSimilar(compactEvs);

        // Then filter the compact with the filter argument
        var filteredEvs = compactEvs.filter(filter);

        // Refresh the events list
        children.events.update(filteredEvs);

        // Signal that the list is rendered.
        // It seems that setTimeout is required to allow the fetched events
        // to fill the scrollable container.
        setTimeout(function () {
          self.emit('idle');
        }, 0);
      });
    }
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      // Stop listening events
      localBus.off();
      // Unbind events view
      ui.unbindAll(children);
      children = {};
    }
  };
};
