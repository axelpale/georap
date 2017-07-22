// User Management UI

var users = tresdb.stores.users;
var ui = tresdb.ui;
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');

module.exports = function () {

  // Init
  var self = this;
  emitter(self);


  // Public methods

  self.bind = function ($mount) {
    $mount.html(template());

    var $loading = $('#tresdb-admin-users-loading');
    var $table = $('#tresdb-admin-users-table');

    // Fetch users and include to page.
    ui.show($loading);
    users.getAll(function (err, rawUsers) {
      // Hide loading bar
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Reveal user table
      $table.html(tableTemplate({
        users: rawUsers,
      }));
    });
  };

  this.unbind = function () {
  };

};
