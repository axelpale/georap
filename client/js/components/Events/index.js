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
    console.log('scroll', scrollerEl.scrollTop);
    _scrollPosition = scrollerEl.scrollTop;
  };

  scrollerEl.addEventListener('scroll', _scrollListener);
};

var stopScrollRecording = function () {
  var scrollerEl = document.getElementById('card-layer-content');
  scrollerEl.removeEventListener('scroll', _scrollListener);
};

var applyRecordedScroll = function () {
  console.log('apply scroll', _scrollPosition);
  var scrollerEl = document.getElementById('card-layer-content');
  console.log('to scroll', scrollerEl.scrollTop);
  scrollerEl.scrollTop = _scrollPosition;
};

module.exports = function () {
  // Parameters:
  //   events
  //     models.Events

  // Init
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

    // Fetch events and apply previously recorded scroll position.
    updateView(function () {

    });

    // Update rendered on change
    events.on('events_changed', updateView);

    setTimeout(function () {
      applyRecordedScroll();
    }, 0);

    // Record scroll positions
    startScrollRecording();
  };

  this.unbind = function () {
    events.off('events_changed', updateView);
    stopScrollRecording();
  };

};
