// User Management UI
//
var admin = georap.stores.admin;
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');
var components = require('georap-components');
var DeletedUsers = require('./Deleted');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function () {

  // Init
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Public methods

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: __,
    }));

    $elems.loading = $mount.find('.admin-users-loading');
    $elems.table = $mount.find('.admin-users-table');
    $elems.buttons = $mount.find('.admin-users-buttons');

    // Fetch users and include to page.
    ui.show($elems.loading);
    admin.getUsers(function (err, rawUsers) {
      // Hide loading bar
      ui.hide($elems.loading);

      if (err) {
        console.error(err);
        return;
      }

      // Reveal buttons after load
      ui.show($elems.buttons);

      // Reveal user table. Only non-deleted users.
      $elems.table.html(tableTemplate({
        users: rawUsers.filter(function (user) {
          return !user.deleted;
        }),
        __: __,
      }));

      // Optionally list also deleted users
      var comp = new DeletedUsers(rawUsers);
      children.deletedUsers = new components.Opener(comp);
      children.deletedUsers.bind({
        $container: $mount.find('.admin-users-deleted'),
        $button: $mount.find('.admin-users-deleted-opener'),
      });
    });

  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };

};
