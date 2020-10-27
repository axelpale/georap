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

module.exports = function () {
  // Parameters:
  //   events
  //     models.Events

  // Init
  emitter(this);

  // Public methods

  this.bind = function ($mount) {

    // Render initial page with loading bar
    $mount.html(template());

    var $loading = $('#tresdb-events-loading');
    var $list = $('#tresdb-events-list');

    // Fetch events for rendering.
    events.getRecent(LIST_SIZE, function (err, rawEvents) {
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
    });

    // Update rendered on change
    events.on('events_changed', function () {
      events.getRecent(LIST_SIZE, function (err, rawEvents) {
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
      });
    });

  };

  this.unbind = function () {
    // Only view for events, so it is safe to off everything.
    events.off();
  };

};
