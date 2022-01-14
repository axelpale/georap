// User Management UI
//
var admin = georap.stores.admin;
var template = require('./template.ejs');
var tableTemplate = require('./table.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var components = require('georap-components');
var CreationComponent = require('./Creation');
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

    children.creation = new components.Opener(CreationComponent);
    var $creationContainer = $mount.find('.admin-users-creation');
    var $creationOpener = $mount.find('.admin-users-creation-opener');
    children.creation.bind($creationContainer, $creationOpener);

    // Fetch users and include to page.
    ui.show($elems.loading);
    admin.getUsers(function (err, rawUsers) {
      // Hide loading bar
      ui.hide($elems.loading);

      if (err) {
        console.error(err);
        return;
      }

      // Reveal user table
      $elems.table.html(tableTemplate({
        users: rawUsers,
        __: __,
      }));
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
