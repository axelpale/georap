// Component for a list of events.

var emitter = require('component-emitter');
var pointstamp = require('../lib/pointstamp');
var timestamp = require('../lib/timestamp');
var prettyEvents = require('pretty-events');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var ui = require('tresdb-ui');
var events = tresdb.stores.events;

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
  emitter(this);

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
    $mount.on('mouseover', function (ev) {
      if (typeof ev.target.href === 'string') {
        var match = ev.target.href.match(locationIdPattern);
        if (match) {
          var locationId = match[1];
          self.emit('mouseover-location', locationId);
        }
      }
    });
  };

  this.unbind = function () {
    events.off('events_changed', updateView);
    stopScrollRecording();
  };

};
