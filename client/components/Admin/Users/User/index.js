// User Management UI

var template = require('./template.ejs');
var InfoComponent = require('./Info');
var EventsComponent = require('./Events');
var RoleComponent = require('./Role');
var RemovalComponent = require('./Removal');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var admin = georap.stores.admin;
var able = georap.stores.account.able;
var __ = georap.i18n.__;

module.exports = function (username) {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      username: username,
      __: __,
    }));

    $elems.loading = $mount.find('.admin-user-loading');

    // Fetch users and include to page.
    ui.show($elems.loading);
    admin.getUser(username, function (err, user) {
      // Hide loading bar
      ui.hide($elems.loading);

      if (err) {
        console.error(err);
        return;
      }

      // Construct and bind child components

      $elems.infoRoot = $mount.find('.admin-user-info-root');
      children.infoComp = new InfoComponent(user);
      children.infoComp.bind($elems.infoRoot);

      if (!user.deleted) {
        $elems.eventsRoot = $mount.find('.admin-user-events-root');
        children.eventsComp = new EventsComponent(user);
        children.eventsComp.bind($elems.eventsRoot);

        if (able('admin-users-rerole')) {
          $elems.roleRoot = $mount.find('.admin-user-role-root');
          children.roleComp = new RoleComponent(user);
          children.roleComp.bind($elems.roleRoot);
        }

        if (able('admin-users-delete')) {
          $elems.removalRoot = $mount.find('.admin-user-removal-root');
          $elems.removalSuccess = $mount.find('.admin-user-removal-success');
          children.removalComp = new RemovalComponent(user);
          children.removalComp.bind($elems.removalRoot);
          children.removalComp.on('success', function () {
            children.infoComp.unbind();
            children.roleComp.unbind();
            children.removalComp.unbind();
            ui.show($elems.removalSuccess);
          });
        }
      }

    });
  };

  self.unbind = function () {
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
