
var users = tresdb.stores.users;
var EventsView = require('../Events');
var template = require('./template.ejs');
var pointsTemplate = require('./points.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');

module.exports = function (username) {
  // Parameters
  //   username
  //     string

  // Init
  var self = this;
  emitter(self);
  var children = {};
  var $mount = null;

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      username: username,
    }));

    // Fetch user before further rendering.
    users.getOneWithEvents(username, function (err, user) {
      // Hide loading bar
      ui.hide($('#tresdb-user-loading'));

      if (err) {
        console.error(err);
        return;
      }

      // User statistics
      $('#tresdb-user-points').html(pointsTemplate({
        flags: user.flagsCreated,
        adds: user.locationsCreated,
        posts: user.postsCreated,
        classifications: user.locationsClassified,
        comments: user.commentsCreated,
        points: user.points,
      }));

      children.events = new EventsView(user.events);
      children.events.bind($('#tresdb-user-events'));
    });
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };

};
