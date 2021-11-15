// User Management UI

var admin = georap.stores.admin;
var template = require('./template.ejs');
var InfoComponent = require('./Info');
var StatusComponent = require('./Status');
var EventsComponent = require('./Events');
var RoleComponent = require('./Role');
var emitter = require('component-emitter');
var ui = require('georap-ui');

module.exports = function (username) {

  // Init
  var self = this;
  emitter(self);

  // Components
  var infoComp, eventsComp, roleComp, statusComp;


  // Public methods

  self.bind = function ($mount) {

    $mount.html(template({
      username: username,
    }));

    var $infoRoot = $('#georap-admin-user-info-root');
    var $statusRoot = $('#georap-admin-user-status-root');
    var $eventsRoot = $('#georap-admin-user-events-root');
    var $loading = $('#georap-admin-user-loading');
    var $roleRoot = $('#georap-admin-user-role-root');

    // Fetch users and include to page.
    ui.show($loading);
    admin.getUser(username, function (err, user) {
      // Hide loading bar
      ui.hide($loading);

      if (err) {
        console.error(err);
        return;
      }

      // Construct and bind child components
      infoComp = new InfoComponent(user);
      statusComp = new StatusComponent(user);
      eventsComp = new EventsComponent(user);
      roleComp = new RoleComponent(user);

      infoComp.bind($infoRoot);
      statusComp.bind($statusRoot);
      eventsComp.bind($eventsRoot);
      roleComp.bind($roleRoot);
    });
  };


  self.unbind = function () {
    infoComp.unbind();
    statusComp.unbind();
    eventsComp.unbind();
    roleComp.unbind();
  };

};
