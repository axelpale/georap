// Component for a list of events.

var emitter = require('component-emitter');
var pointstamp = require('../lib/pointstamp');
var timestamp = require('../lib/timestamp');
var prettyEvents = require('pretty-events');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var ui = require('tresdb-ui');
var models = require('tresdb-models');
var events = tresdb.stores.events;
var locations = tresdb.stores.locations;

var LIST_SIZE = 200;

// Record scroll position to help browsing through the list
// and avoid scrolling in other views to affect the events list.
// The state and the methods need to be placed outside of the view class
// because the class is recreated every time.
var _scrollPosition = 0;
var _scrollListener = null;

var startScrollRecording = function () {
  var scrollerEl = document.getElementById('card-layer-content');

  _scrollListener = function () {
    _scrollPosition = scrollerEl.scrollTop;
  };

  scrollerEl.addEventListener('scroll', _scrollListener);
};

var stopScrollRecording = function () {
  var scrollerEl = document.getElementById('card-layer-content');
  scrollerEl.removeEventListener('scroll', _scrollListener);
};

var applyRecordedScroll = function () {
  var scrollerEl = document.getElementById('card-layer-content');
  scrollerEl.scrollTop = _scrollPosition;
};

module.exports = function () {
  // Parameters:
  //   events
  //     models.Events

  // Init
  var self = this;
  emitter(self);

  // Collect location data in events. Can be used to display
  // markers associated with the events.
  var fetchedMarkerLocations = {};

  // Event handler that is easy to off.
  var updateView = function (callback) {
    // Parameters:
    //   callback: optional function ()
    //
    var $loading = $('#tresdb-events-loading');
    var $list = $('#tresdb-events-list');

    // Fetch events for rendering.
    events.getRecent(LIST_SIZE, function (err, rawEvents) {
      // Ensure loading bar is hidden.
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Collect location data in events
      rawEvents.forEach(function (rev) {
        if (rev.location) {
          var mloc = models.rawLocationToMarkerLocation(rev.location);
          fetchedMarkerLocations[mloc._id] = mloc;
        }
      });

      var compactEvs = prettyEvents.mergeLocationCreateRename(rawEvents);
      compactEvs = prettyEvents.mergeEntryCreateEdit(compactEvs);
      compactEvs = prettyEvents.dropEntryCommentDeleteGroups(compactEvs);
      compactEvs = prettyEvents.dropEntryCommentChanged(compactEvs);
      compactEvs = prettyEvents.mergeSimilar(compactEvs);

      $list.html(listTemplate({
        pointstamp: pointstamp,
        timestamp: timestamp,
        events: compactEvs,
      }));

      if (callback) {
        return callback();
      }
    });
  };

  // Public methods

  this.bind = function ($mount) {
    // Render initial page with visible loading bar
    $mount.html(template());

    // Fetch events and then apply previously recorded scroll position.
    // It seems that setTimeout is required to allow the fetched events
    // to fill the scrollable container. Then, begin recording further
    // scrolls.
    updateView(function () {
      setTimeout(function () {
        applyRecordedScroll();

        // Record scroll positions
        startScrollRecording();
      }, 0);
    });

    // Update rendered on change
    events.on('events_changed', updateView);

    // Detect if hovering a location link.
    // This data can be used to emphasize markers.
    var locationIdPattern = /\/locations\/([0-9a-f]*)/i;
    // Prevent duplicate binds
    $mount.off('mouseover');
    $mount.off('mouseout');
    // Detect hover
    $mount.on('mouseover', function (ev) {
      if (typeof ev.target.href === 'string') {
        var match = ev.target.href.match(locationIdPattern);
        if (match) {
          var locationId = match[1];
          var mloc = fetchedMarkerLocations[locationId];
          if (mloc) {
            locations.selectLocation(mloc);
          }
        }
      }
    });
    $mount.on('mouseout', function (ev) {
      if (typeof ev.target.href === 'string') {
        var match = ev.target.href.match(locationIdPattern);
        if (match) {
          var locationId = match[1];
          locations.deselectLocation(locationId);
        }
      }
    });
  };

  this.unbind = function () {
    events.off('events_changed', updateView);
    stopScrollRecording();
    // Ensure that fetched locations become garbage collected
    Object.keys(fetchedMarkerLocations).forEach(function (lid) {
      delete fetchedMarkerLocations[lid];
    });
  };

};
