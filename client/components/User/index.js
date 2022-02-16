
var usersApi = georap.stores.users;
var EventsMoreView = require('../EventsMore');
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
  var $elems = {};
  var children = {};
  var $mount = null;

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      username: username,
      __: __,
    }));

    $elems.progress = $mount.find('.user-progress');
    $elems.points = $mount.find('.user-points');
    $elems.events = $mount.find('.user-events');

    // Fetch user before further rendering.
    usersApi.getOne(username, function (err, user) {
      // Hide loading bar
      ui.hide($elems.progress);

      if (err) {
        console.error(err);
        return;
      }

      // User statistics
      $elems.points.html(pointsTemplate({
        createdAt: ui.timestamp(user.createdAt, georap.i18n.locale),
        flagConfig: flagConfig,
        flags: user.flagsCreated,
        adds: user.locationsCreated,
        posts: user.postsCreated,
        classifications: user.locationsClassified,
        comments: user.commentsCreated,
        __: __,
      }));

      children.events = new EventsMoreView(function (skip, limit, callback) {
        usersApi.getEvents({
          username: username,
          skip: skip,
          limit: limit,
        }, callback);
      }, {
        listSize: 15,
      });
      children.events.bind($elems.events);
    });
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };

};
