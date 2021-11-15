// Component to list filtered lists of events.
//
var emitter = require('component-emitter');
var prettyEvents = require('pretty-events');
var ui = require('georap-ui');
var template = require('./template.ejs');
var EventsView = require('../../Events');
var LocationSelector = require('../LocationSelector');
var rootBus = require('georap-bus');
var eventsStore = georap.stores.events;

var LIST_SIZE = 100;

module.exports = function () {
  // Init
  var $mount = null;
  var children = {};
  var $elems = {};
  var bus = rootBus.sub();
  var self = this;
  emitter(self);

  var skip = 0;
  var limit = LIST_SIZE;

  var prependEvent = function (ev) {
    // Append single event in the beginning
    if ($mount) {
      if (children['block-0']) {
        children['block-0'].prepend(ev);
      }
    }
  };

  var appendEvents = function (evs) {
    // Append events in the end
    if ($mount) {
      var $container = $('<div class="location-entries-block"></div>');
      var view = new EventsView(evs, {
        showThumbnails: true,
      });
      $elems.events.append($container);
      view.bind($container);
      children['block-' + skip] = view;
    }
  };

  var fetchAndAppend = function (callback) {
    if ($mount) {
      ui.show($elems.progress);
      ui.hide($elems.loadMoreBtn);
      eventsStore.getRecent({
        skip: skip,
        limit: limit,
      }, function (err, result) {
        if (!$mount) {
          // Happens when quickly navigating tabs
          return;
        }

        ui.hide($elems.progress);
        if (err) {
          $elems.error.html(err.message);
          ui.show($elems.error);
          return;
        }

        var events = result.events;

        // Collect location data in events. Use to emphasize map markers.
        children.selector.readMarkerLocationsFromEvents(events);
        // Hide some unnecessary events to make the list more readable.
        var compactEvs = prettyEvents.mergeLocationCreateRename(events);
        compactEvs = prettyEvents.mergeEntryCreateEdit(compactEvs);
        compactEvs = prettyEvents.dropEntryCommentDeleteGroups(compactEvs);
        compactEvs = prettyEvents.dropEntryCommentChanged(compactEvs);
        compactEvs = prettyEvents.mergeSimilar(compactEvs);

        appendEvents(compactEvs);

        ui.show($elems.loadMoreBtn);

        if (callback) {
          return callback();
        }
      });
    }
  };

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    $mount.html(template());

    // Set up elements
    $elems.events = $mount.find('.latest-events');
    $elems.progress = $mount.find('.latest-events-progress');
    $elems.loadMoreBtn = $mount.find('.latest-load-more');
    $elems.error = $mount.find('.latest-events-error');

    // Select associated marker by clicking an event or hovering cursor on it.
    children.selector = new LocationSelector();
    children.selector.bind($elems.events);

    ui.show($elems.loadMoreBtn);
    // Click to load more
    $elems.loadMoreBtn.click(function () {
      skip += limit;
      fetchAndAppend();
    });

    // Initial event fetch and list render
    fetchAndAppend(function () {
      // Signal that the list is rendered.
      // It seems that setTimeout is required to allow the fetched events
      // to fill the scrollable container.
      setTimeout(function () {
        self.emit('idle');
      }, 0);
    });

    // Render any new event
    bus.on('socket_event', function (ev) {
      prependEvent(ev);
    });
  };

  self.unbind = function () {
    if ($mount) {
      // Stop listening events
      bus.off();
      // Unbind events view
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      // Clear
      $mount.empty();
      $mount = null;
    }
  };
};
