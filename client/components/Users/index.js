
var usersApi = georap.stores.users;
var template = require('./template.ejs');
var listTemplate = require('./list.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function () {

  // Init
  emitter(this);

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      __: __,
    }));

    // Fetch users and include to page.
    usersApi.getAll(function (err, rawUsers) {
      // Hide loading bar
      ui.hide($('#georap-users-loading'));

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
      $('#georap-users-alltime').html(listTemplate({
        users: bestUsersAllTime,
      }));

      $('#georap-users-365days').html(listTemplate({
        users: bestUsersOf365days.map(function (u) {
          // Template uses u.points
          return Object.assign({}, u, { points: u.points365days });
        }).filter(hasPoints),
        prefix: '+',
      }));

      $('#georap-users-30days').html(listTemplate({
        users: bestUsersOf30days.map(function (u) {
          // Template uses u.points
          return Object.assign({}, u, { points: u.points30days });
        }).filter(hasPoints),
        prefix: '+',
      }));

      $('#georap-users-7days').html(listTemplate({
        users: bestUsersOf7days.map(function (u) {
          // Template uses u.points
          return Object.assign({}, u, { points: u.points7days });
        }).filter(hasPoints),
        prefix: '+',
      }));
    });
  };

  this.unbind = function () {
    // noop
  };

};
