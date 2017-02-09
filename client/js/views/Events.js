
var emitter = require('component-emitter');
var timestamp = require('./lib/timestamp');
var template = require('./Events.ejs');
var eventsListTemplate = require('./EventsList.ejs');

module.exports = function (events) {
  // Parameters:
  //   events
  //     models.Events

  // Init
  emitter(this);

  // Private methods declaration

  // Public methods

  this.render = function () {
    var eventsHtml = eventsListTemplate({
      timestamp: timestamp,
      events: events,
    });

    return template({
      eventsHtml: eventsHtml,
    });
  };

  this.bind = function () {
    // noop
  };

  this.unbind = function () {
    // noop
  };


  // Private methods


};
