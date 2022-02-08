
var usersApi = georap.stores.users;
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function () {

  // Init
  var $mount = null;
  var $els = {};
  emitter(this);

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: __,
    }));

    $els.progress = $mount.find('.users-loading');
    $els.alltime = $mount.find('.users-alltime');
    $els.days365 = $mount.find('.users-365days');
    $els.days30 = $mount.find('.users-30days');
    $els.days7 = $mount.find('.users-7days');

    // Fetch users and include to page.
    usersApi.getAll(function (err, rawUsers) {
      // Hide loading bar
      ui.hide($els.progress);

      if (err) {
        console.error(err);
        return;
      }

      // Order by points
      var bestUsersAllTime = rawUsers.sort(function (ua, ub) {
        return ub.points - ua.points;
      });
      var VIEW_TOP = 10;
      // Slice to copy because sort manipulates the original.
      var bestUsersOf365days = rawUsers.slice().sort(function (ua, ub) {
        return ub.points365days - ua.points365days;
      }).slice(0, VIEW_TOP);
      var bestUsersOf30days = rawUsers.slice().sort(function (ua, ub) {
        return ub.points30days - ua.points30days;
      }).slice(0, VIEW_TOP);
      var bestUsersOf7days = rawUsers.slice().sort(function (ua, ub) {
        return ub.points7days - ua.points7days;
      }).slice(0, VIEW_TOP);

      // Hide zero-point users from top lists
      var hasPoints = function (u) {
        return u.points > 0;
      };

      // Reveal list
      $els.alltime.html(listTemplate({
        users: bestUsersAllTime,
      }));

      $els.days365.html(listTemplate({
        users: bestUsersOf365days.map(function (u) {
          // Template uses u.points
          return Object.assign({}, u, { points: u.points365days });
        }).filter(hasPoints),
        prefix: '+',
      }));

      $els.days30.html(listTemplate({
        users: bestUsersOf30days.map(function (u) {
          // Template uses u.points
          return Object.assign({}, u, { points: u.points30days });
        }).filter(hasPoints),
        prefix: '+',
      }));

      $els.days7.html(listTemplate({
        users: bestUsersOf7days.map(function (u) {
          // Template uses u.points
          return Object.assign({}, u, { points: u.points7days });
        }).filter(hasPoints),
        prefix: '+',
      }));
    });
  };

  this.unbind = function () {
    if ($mount) {
      ui.offAll($els);
      $els = {};
      $mount = null;
    }
  };

};
