// User Management UI

var admin = georap.stores.admin;
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function () {

  // Init
  var self = this;
  emitter(self);

  // Public methods

  self.bind = function ($mount) {
    $mount.html(template({
      __: __,
    }));

    var $loading = $('#admin-users-loading');
    var $table = $('#admin-users-table');

    // Fetch users and include to page.
    ui.show($loading);
    admin.getUsers(function (err, rawUsers) {
      // Hide loading bar
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Reveal user table
      $table.html(tableTemplate({
        users: rawUsers,
        __: __,
      }));
    });
  };

  this.unbind = function () {
  };

};
