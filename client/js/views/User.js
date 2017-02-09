
var emitter = require('component-emitter');
var template = require('./User.ejs');
var timestamp = require('./lib/timestamp');
var eventsListTemplate = require('./EventsList.ejs');

module.exports = function (user) {
  // Parameters:
  //   user
  //     raw user object from server

  // Init
  emitter(this);

  // Private methods declaration

  // Public methods

  this.render = function () {

    var eventsHtml = eventsListTemplate({
      timestamp: timestamp,
      events: user.events,
    });

    return template({
      user: user,
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
