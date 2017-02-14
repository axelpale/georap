
var emitter = require('component-emitter');
var users = require('../stores/users');
var template = require('./User.ejs');
var timestamp = require('./lib/timestamp');
var eventsListTemplate = require('./EventsList.ejs');

module.exports = function (username) {
  // Parameters
  //   username
  //     string

  // Init
  emitter(this);

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      username: username,
    }));

    // Fetch user before further rendering.
    users.getOne(username, function (err, user) {
      // Hide loading bar
      $('#tresdb-user-loading').addClass('hidden');

      if (err) {
        console.error(err);
        return;
      }

      $('#tresdb-user-events').html(eventsListTemplate({
        timestamp: timestamp,
        events: user.events,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
