
var users = require('../../stores/users');
var eventsListTemplate = require('../Events/list.ejs');
var timestamp = require('../lib/timestamp');
var template = require('./template.ejs');
var emitter = require('component-emitter');

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
