// Component for a list of events.

var emitter = require('component-emitter');
var prettyEvents = require('pretty-events');
var TabsView = require('./Tabs');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var ui = require('tresdb-ui');
var eventModel = require('./Event/model');
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
  var children = {};

  // var tabs = {
  //   'activity': 'activity view',
  //   'locations': 'locations view',
  //   'posts': 'posts view',
  // };

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
        pointstamp: ui.pointstamp,
        timestamp: ui.timestamp,
        getPoints: eventModel.getPoints,
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

    // Set up tabs
    children.tabs = new TabsView();
    children.tabs.bind($mount.find('.latest-tabs-container'));

    // Select associated marker by clicking an event or hovering cursor on it.
    // Prevent duplicate binds
    var $list = $('#tresdb-events-list');
    $list.off('click');
    $list.off('mouseover');
    $list.off('mouseout');
    // Detect hover
    var _trySelectLocation = function (ev) {
      var locationId = null;
      if (typeof ev.target.dataset.locationid === 'string') {
        locationId = ev.target.dataset.locationid;
      } else {
        var parent = ev.target.parentElement;
        if (typeof parent.dataset.locationid === 'string') {
          locationId = parent.dataset.locationid;
        }
      }
      if (locationId) {
        var mloc = fetchedMarkerLocations[locationId];
        if (mloc) {
          locations.selectLocation(mloc);
        }
      }
    };
    $list.on('click', _trySelectLocation);
    $list.on('mouseover', _trySelectLocation);
    $list.on('mouseout', function (ev) {
      // Outside li
      if (typeof ev.target.dataset.locationid === 'string') {
        var locationId = ev.target.dataset.locationid;
        locations.deselectLocation(locationId);
      }
    });
  };

  this.unbind = function () {
    events.off('events_changed', updateView);
    stopScrollRecording();
    // Deselect any selected locations
    locations.deselectAll();
    // Ensure that fetched locations become garbage collected
    Object.keys(fetchedMarkerLocations).forEach(function (lid) {
      delete fetchedMarkerLocations[lid];
    });
    // Other stuff
    ui.unbindAll(children);
  };

};
