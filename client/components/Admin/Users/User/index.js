// User Management UI

var admin = georap.stores.admin;
var template = require('./template.ejs');
var InfoComponent = require('./Info');
var StatusComponent = require('./Status');
var EventsComponent = require('./Events');
var RoleComponent = require('./Role');
var RestoreComponent = require('./Restore');
var RemovalComponent = require('./Removal');
var emitter = require('component-emitter');
var ui = require('georap-ui');
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

    $elems.infoRoot = $mount.find('.admin-user-info-root');
    $elems.statusRoot = $mount.find('.admin-user-status-root');
    $elems.eventsRoot = $mount.find('.admin-user-events-root');
    $elems.loading = $mount.find('.admin-user-loading');
    $elems.roleRoot = $mount.find('.admin-user-role-root');

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
      children.infoComp = new InfoComponent(user);
      children.infoComp.bind($elems.infoRoot);

      if (user.deleted) {
        $elems.restoreRoot = $mount.find('.admin-user-restore-root');
        children.restoreComp = new RestoreComponent(user);
        children.restoreComp.bind($elems.restoreRoot);
      } else {
        children.statusComp = new StatusComponent(user);
        children.statusComp.bind($elems.statusRoot);

        children.eventsComp = new EventsComponent(user);
        children.eventsComp.bind($elems.eventsRoot);

        children.roleComp = new RoleComponent(user);
        children.roleComp.bind($elems.roleRoot);

        $elems.removalRoot = $mount.find('.admin-user-removal-root');
        $elems.removalSuccess = $mount.find('.admin-user-removal-success');
        children.removalComp = new RemovalComponent(user);
        children.removalComp.bind($elems.removalRoot);
        children.removalComp.on('success', function () {
          children.infoComp.unbind();
          children.statusComp.unbind();
          children.roleComp.unbind();
          children.removalComp.unbind();
          ui.show($elems.removalSuccess);
        });
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
