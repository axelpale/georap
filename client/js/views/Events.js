
var emitter = require('component-emitter');
var events = require('../stores/events');
var timestamp = require('./lib/timestamp');
var template = require('./Events.ejs');
var listTemplate = require('./EventsList.ejs');

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

    // Fetch events before rendering.
    events.getRecent(0, function (err, rawEvents) {

      $loading.addClass('hidden');

      if (err) {
        console.error(err);
        return;
      }

      $list.html(listTemplate({
        timestamp: timestamp,
        events: rawEvents,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
