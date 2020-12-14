// User Management UI

var admin = tresdb.stores.admin;
var template = require('./template.ejs');
var InfoComponent = require('./Info');
var StatusComponent = require('./Status');
var EventsComponent = require('./Events');
var RoleComponent = require('./Role');
var emitter = require('component-emitter');
var ui = require('tresdb-ui');

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

    var $infoRoot = $('#tresdb-admin-user-info-root');
    var $statusRoot = $('#tresdb-admin-user-status-root');
    var $eventsRoot = $('#tresdb-admin-user-events-root');
    var $loading = $('#tresdb-admin-user-loading');
    var $roleRoot = $('#tresdb-admin-user-role-root');

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
