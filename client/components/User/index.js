
var usersApi = georap.stores.users;
var EventsView = require('../Events');
var template = require('./template.ejs');
var pointsTemplate = require('./points.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var flagConfig = georap.config.entryFlags;
var __ = georap.i18n.__;

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
      __: __,
    }));

    // Fetch user before further rendering.
    usersApi.getOneWithEvents(username, function (err, user) {
      // Hide loading bar
      ui.hide($('#georap-user-loading'));

      if (err) {
        console.error(err);
        return;
      }

      // User statistics
      $('#georap-user-points').html(pointsTemplate({
        flagConfig: flagConfig,
        flags: user.flagsCreated,
        adds: user.locationsCreated,
        posts: user.postsCreated,
        classifications: user.locationsClassified,
        comments: user.commentsCreated,
        points: user.points,
        __: __,
      }));

      children.events = new EventsView(user.events);
      children.events.bind($('#georap-user-events'));
    });
  };

  this.unbind = function () {
    ui.unbindAll(children);
  };

};
