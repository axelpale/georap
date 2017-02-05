
var emitter = require('component-emitter');
var timestamp = require('./lib/timestamp');
var template = require('./Events.ejs');

module.exports = function (events) {
  // Parameters:
  //   events
  //     models.Events

  // Init
  emitter(this);

  // Private methods declaration

  // Public methods

  this.render = function () {
    return template({
      timestamp: timestamp,
      events: events,
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
