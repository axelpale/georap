// Component for a list of events.

var emitter = require('component-emitter');
var events = require('../../stores/events');
var pointstamp = require('../lib/pointstamp');
var timestamp = require('../lib/timestamp');
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');

var LIST_SIZE = 100;

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

      $loading.addClass('hidden');

      if (err) {
        console.error(err);
        return;
      }

      $list.html(listTemplate({
        pointstamp: pointstamp,
        timestamp: timestamp,
        events: rawEvents,
      }));

    });

    // Update rendered on change
    events.on('events_changed', function () {
      events.getRecent(LIST_SIZE, function (err, rawEvents) {
        if (err) {
          console.error(err);
          return;
        }
        $list.html(listTemplate({
          pointstamp: pointstamp,
          timestamp: timestamp,
          events: rawEvents,
        }));
      });
    });

  };

  this.unbind = function () {
    // Only view for events, so it is safe to off everything.
    events.off();
  };

};
