
var users = require('../../stores/users');
var eventsListTemplate = require('../Events/list.ejs');
var timestamp = require('../lib/timestamp');
var pointstamp = require('../lib/pointstamp');
var template = require('./template.ejs');
var pointsTemplate = require('./points.ejs');
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
    users.getOneWithEvents(username, function (err, user) {
      // Hide loading bar
      $('#tresdb-user-loading').addClass('hidden');

      if (err) {
        console.error(err);
        return;
      }

      $('#tresdb-user-points').html(pointsTemplate({
        visits: user.locationsVisited,
        adds: user.locationsCreated,
        posts: user.postsCreated,
        comments: user.commentsCreated,
        points: user.points,
      }));

      $('#tresdb-user-events').html(eventsListTemplate({
        timestamp: timestamp,
        pointstamp: pointstamp,
        events: user.events,
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
