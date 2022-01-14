// User Management UI

var admin = georap.stores.admin;
var template = require('./template.ejs');
var InfoComponent = require('./Info');
var StatusComponent = require('./Status');
var EventsComponent = require('./Events');
var RoleComponent = require('./Role');
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

    $elems.infoRoot = $('.admin-user-info-root');
    $elems.statusRoot = $('.admin-user-status-root');
    $elems.eventsRoot = $('.admin-user-events-root');
    $elems.loading = $('.admin-user-loading');
    $elems.roleRoot = $('.admin-user-role-root');

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
      children.statusComp = new StatusComponent(user);
      children.eventsComp = new EventsComponent(user);
      children.roleComp = new RoleComponent(user);

      children.infoComp.bind($elems.infoRoot);
      children.statusComp.bind($elems.statusRoot);
      children.eventsComp.bind($elems.eventsRoot);
      children.roleComp.bind($elems.roleRoot);
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
